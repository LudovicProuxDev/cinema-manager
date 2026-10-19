using System.Net;
using System.Net.Http.Json;
using CinemaManager.Api.Data;
using CinemaManager.Api.Tests.Data;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Tests.Controllers;

/// <summary>
/// The CRUD behaviour every controller shares. Each derived class describes its resource
/// (route, a valid request, how to change it) and adds the rules specific to it.
/// </summary>
public abstract class CrudControllerTests<TRequest, TResponse>(DatabaseFixture database)
{
    protected const int UnknownId = int.MaxValue;

    protected DatabaseFixture Database { get; } = database;
    protected HttpClient Client { get; } = database.CreateClient();

    protected abstract string Route { get; }

    /// <summary>A valid request. Seeds the resources it references.</summary>
    protected abstract Task<TRequest> NewRequestAsync();

    /// <summary>A valid request that differs from <paramref name="request"/>.</summary>
    protected abstract Task<TRequest> ModifyAsync(TRequest request);

    protected abstract int IdOf(TResponse response);

    protected abstract void AssertMatches(TRequest expected, TResponse actual);

    [Fact]
    public async Task Create_ReturnsCreatedWithItsLocation()
    {
        var request = await NewRequestAsync();

        var response = await Client.PostAsJsonAsync(Route, request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = (await response.Content.ReadFromJsonAsync<TResponse>())!;
        AssertMatches(request, created);
        Assert.Equal($"{Route}/{IdOf(created)}", response.Headers.Location?.AbsolutePath);
    }

    [Fact]
    public async Task GetAll_ContainsTheCreatedResource()
    {
        var created = await CreateAsync(await NewRequestAsync());

        var all = await Client.GetFromJsonAsync<List<TResponse>>(Route);

        Assert.Contains(all!, resource => IdOf(resource) == IdOf(created));
    }

    [Fact]
    public async Task GetById_ReturnsTheResource()
    {
        var request = await NewRequestAsync();
        var created = await CreateAsync(request);

        var found = (await Client.GetFromJsonAsync<TResponse>($"{Route}/{IdOf(created)}"))!;

        Assert.Equal(IdOf(created), IdOf(found));
        AssertMatches(request, found);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNotFound()
    {
        var response = await Client.GetAsync($"{Route}/{UnknownId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ReplacesTheResource()
    {
        var request = await NewRequestAsync();
        var id = IdOf(await CreateAsync(request));
        var modified = await ModifyAsync(request);

        var response = await Client.PutAsJsonAsync($"{Route}/{id}", modified);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        AssertMatches(modified, (await Client.GetFromJsonAsync<TResponse>($"{Route}/{id}"))!);
    }

    [Fact]
    public async Task Update_UnknownId_ReturnsNotFound()
    {
        var response = await Client.PutAsJsonAsync($"{Route}/{UnknownId}", await NewRequestAsync());

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_RemovesTheResource()
    {
        var id = IdOf(await CreateAsync(await NewRequestAsync()));

        await AssertDeleteReturnsAsync(id, HttpStatusCode.NoContent);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"{Route}/{id}")).StatusCode);
    }

    [Fact]
    public async Task Delete_UnknownId_ReturnsNotFound() =>
        await AssertDeleteReturnsAsync(UnknownId, HttpStatusCode.NotFound);

    protected async Task<TResponse> CreateAsync(TRequest request)
    {
        var response = await Client.PostAsJsonAsync(Route, request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<TResponse>())!;
    }

    protected async Task AssertCreateReturnsAsync(TRequest request, HttpStatusCode expected)
    {
        var response = await Client.PostAsJsonAsync(Route, request);

        Assert.Equal(expected, response.StatusCode);
    }

    /// <summary>Asserts the request is rejected by validation (not by the database) because of <paramref name="field"/>.</summary>
    protected async Task AssertCreateIsInvalidAsync(TRequest request, string field)
    {
        var response = await Client.PostAsJsonAsync(Route, request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains(field, problem!.Errors.Keys);
    }

    protected async Task AssertDeleteReturnsAsync(int id, HttpStatusCode expected)
    {
        var response = await Client.DeleteAsync($"{Route}/{id}");

        Assert.Equal(expected, response.StatusCode);
    }

    /// <summary>Runs a seeding helper (e.g. <see cref="TestData.SeedScreeningAsync"/>) on a fresh context.</summary>
    protected async Task<T> SeedAsync<T>(Func<CinemaDbContext, Task<T>> seed)
    {
        await using var context = Database.CreateContext();
        return await seed(context);
    }

    protected Task<T> SeedAsync<T>(T entity)
        where T : class =>
        SeedAsync(async context =>
        {
            context.Add(entity);
            await context.SaveChangesAsync();
            return entity;
        });
}
