using System.Net;
using System.Net.Http.Json;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class MoviesControllerTests(DatabaseFixture database)
    : CrudControllerTests<MovieRequest, MovieResponse>(database)
{
    private static readonly MovieRequest Valid =
        new(Title: "Inception", DurationMinutes: 148, ReleaseDate: new DateOnly(2010, 7, 16),
            Description: "A thief who steals corporate secrets through dreams.");

    public static TheoryData<MovieRequest, string> InvalidRequests =>
        new()
        {
            { Valid with { Title = "" }, nameof(MovieRequest.Title) },
            { Valid with { Title = new string('x', 201) }, nameof(MovieRequest.Title) },
            { Valid with { Description = new string('x', 2001) }, nameof(MovieRequest.Description) },
            { Valid with { DurationMinutes = 0 }, nameof(MovieRequest.DurationMinutes) },
        };

    protected override string Route => "/movies";

    protected override Task<MovieRequest> NewRequestAsync() => Task.FromResult(Valid);

    protected override Task<MovieRequest> ModifyAsync(MovieRequest request) =>
        Task.FromResult(request with { Title = "Interstellar", Description = null, DurationMinutes = 169 });

    protected override int IdOf(MovieResponse response) => response.Id;

    protected override void AssertMatches(MovieRequest expected, MovieResponse actual) =>
        Assert.Equal(expected, new MovieRequest(
            Title: actual.Title, DurationMinutes: actual.DurationMinutes, ReleaseDate: actual.ReleaseDate, Description: actual.Description));

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(MovieRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public Task Create_WithoutReleaseDate_ReturnsValidationError() =>
        AssertCreateWithJsonIsInvalidAsync(new { title = "Inception", durationMinutes = 148 }, "releaseDate");

    [Fact]
    public async Task Create_WithoutDescription_IsAccepted()
    {
        var response = await Client.PostAsJsonAsync(Route, new { title = "Inception", durationMinutes = 148, releaseDate = "2010-07-16" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WithScreenings_ReturnsConflict()
    {
        var screening = await SeedAsync(TestData.SeedScreeningAsync);

        await AssertDeleteReturnsAsync(screening.MovieId, HttpStatusCode.Conflict);
    }
}
