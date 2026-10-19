using System.Net;
using System.Net.Http.Json;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class ScreeningsControllerTests(DatabaseFixture database)
    : CrudControllerTests<ScreeningRequest, ScreeningResponse>(database)
{
    private static readonly ScreeningRequest Valid =
        new(new DateTime(2026, 11, 1, 20, 30, 0, DateTimeKind.Utc), 9.50m, MovieId: 1, RoomId: 1);

    public static TheoryData<ScreeningRequest, string> InvalidRequests =>
        new()
        {
            { Valid with { Price = -1m }, nameof(ScreeningRequest.Price) },
            { Valid with { Price = 1_000_000m }, nameof(ScreeningRequest.Price) },
        };

    protected override string Route => "/screenings";

    protected override async Task<ScreeningRequest> NewRequestAsync()
    {
        var movie = await SeedAsync(TestData.NewMovie());
        var room = await SeedAsync(TestData.NewRoom());
        return Valid with { MovieId = movie.Id, RoomId = room.Id };
    }

    // Moving to another room is allowed as long as no ticket is sold
    protected override async Task<ScreeningRequest> ModifyAsync(ScreeningRequest request)
    {
        var otherRoom = await SeedAsync(TestData.NewRoom());
        return request with { StartsAt = request.StartsAt.AddDays(1), Price = 12m, RoomId = otherRoom.Id };
    }

    protected override int IdOf(ScreeningResponse response) => response.Id;

    protected override void AssertMatches(ScreeningRequest expected, ScreeningResponse actual) =>
        Assert.Equal(expected, new ScreeningRequest(actual.StartsAt, actual.Price, actual.MovieId, actual.RoomId));

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(ScreeningRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public async Task Create_UnknownMovie_ReturnsBadRequest() =>
        await AssertCreateReturnsAsync(await NewRequestAsync() with { MovieId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_StartTimeWithAnOffset_IsStoredInUtc()
    {
        var request = await NewRequestAsync();

        var response = await Client.PostAsJsonAsync(Route, new
        {
            startsAt = "2026-11-01T22:30:00+02:00",
            price = 9.50m,
            movieId = request.MovieId,
            roomId = request.RoomId,
        });

        response.EnsureSuccessStatusCode();
        var created = (await response.Content.ReadFromJsonAsync<ScreeningResponse>())!;
        Assert.Equal(new DateTime(2026, 11, 1, 20, 30, 0, DateTimeKind.Utc), created.StartsAt);
        Assert.Equal(DateTimeKind.Utc, created.StartsAt.Kind);
    }

    [Fact]
    public async Task Create_WithoutPrice_ReturnsValidationError()
    {
        var request = await NewRequestAsync();

        await AssertCreateWithJsonIsInvalidAsync(
            new { startsAt = "2026-11-01T20:30:00Z", movieId = request.MovieId, roomId = request.RoomId }, "price");
    }

    [Fact]
    public async Task Create_StartTimeWithoutTimeZone_ReturnsValidationError()
    {
        var request = await NewRequestAsync();

        await AssertCreateWithJsonIsInvalidAsync(
            new { startsAt = "2026-11-01T20:30:00", price = 9.50m, movieId = request.MovieId, roomId = request.RoomId },
            nameof(ScreeningRequest.StartsAt));
    }

    [Fact]
    public async Task Update_ChangingRoom_WithoutTickets_IsAccepted()
    {
        // Tickets are sold for another screening, not for this one
        await SeedAsync(TestData.SeedReservationAsync);
        var screening = await SeedAsync(TestData.SeedScreeningAsync);
        var otherRoom = await SeedAsync(TestData.NewRoom());
        var request = new ScreeningRequest(screening.StartsAt, screening.Price, screening.MovieId, otherRoom.Id);

        await AssertUpdateReturnsAsync(screening.Id, request, HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_WithTicketsSold_InTheSameRoom_IsAccepted()
    {
        var screening = (await SeedAsync(TestData.SeedReservationAsync)).Screening;
        var request = new ScreeningRequest(screening.StartsAt.AddHours(1), 12m, screening.MovieId, screening.RoomId);

        await AssertUpdateReturnsAsync(screening.Id, request, HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_ChangingRoom_WithTicketsSold_ReturnsConflict()
    {
        var screening = (await SeedAsync(TestData.SeedReservationAsync)).Screening;
        var otherRoom = await SeedAsync(TestData.NewRoom());
        var request = new ScreeningRequest(screening.StartsAt, screening.Price, screening.MovieId, otherRoom.Id);

        await AssertUpdateReturnsAsync(screening.Id, request, HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_WithReservations_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);

        await AssertDeleteReturnsAsync(reservation.ScreeningId, HttpStatusCode.Conflict);
    }
}
