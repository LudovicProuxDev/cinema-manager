using System.Net;
using System.Net.Http.Json;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CinemaManager.Api.Tests;

/// <summary>
/// Behind nginx, the API must build its URLs (e.g. the Location header) from the address
/// the client used, which nginx passes in the X-Forwarded-* headers.
/// </summary>
[Collection(DatabaseCollection.Name)]
public class ReverseProxyTests(DatabaseFixture database)
{
    [Fact]
    public async Task Location_UsesTheAddressSeenByTheClient()
    {
        await using var api = new CinemaApiFactory(database.ConnectionString).WithWebHostBuilder(builder =>
            builder.ConfigureServices(services => services.AddTransient<IStartupFilter, FromNginxContainer>()));
        using var request = new HttpRequestMessage(HttpMethod.Post, "/rooms")
        {
            Content = JsonContent.Create(new RoomRequest(TestData.NewRoom().Name)),
        };
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "cinema.example:3000");
        request.Headers.Add("X-Forwarded-Prefix", "/api");

        var response = await api.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.StartsWith("https://cinema.example:3000/api/rooms/", response.Headers.Location?.ToString());
    }

    /// <summary>
    /// In Docker, requests reach the API from the nginx container (an address like 172.18.0.5),
    /// while the in-memory test server has no client address at all: set one.
    /// </summary>
    private sealed class FromNginxContainer : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
        {
            app.Use((context, nextMiddleware) =>
            {
                context.Connection.RemoteIpAddress = IPAddress.Parse("172.18.0.5");
                return nextMiddleware(context);
            });
            next(app);
        };
    }
}
