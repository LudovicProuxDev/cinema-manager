using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CinemaManager.Api.Tests.Data;

/// <summary>Hosts the API in memory, connected to the given (test) database.</summary>
public sealed class CinemaApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseSetting("ConnectionStrings:CinemaDb", connectionString);
}
