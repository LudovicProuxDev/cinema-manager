using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class ReservationsControllerTests(DatabaseFixture database)
    : CrudControllerTests<ReservationRequest, ReservationResponse>(database)
{
    protected override string Route => "/reservations";

    protected override async Task<ReservationRequest> NewRequestAsync()
    {
        var user = await SeedAsync(TestData.NewUser());
        var screening = await SeedAsync(TestData.SeedScreeningAsync);
        return new ReservationRequest(user.Id, screening.Id);
    }

    // Moving to another screening is allowed as long as the reservation has no ticket
    protected override async Task<ReservationRequest> ModifyAsync(ReservationRequest request)
    {
        var otherUser = await SeedAsync(TestData.NewUser());
        var otherScreening = await SeedAsync(TestData.SeedScreeningAsync);
        return new ReservationRequest(otherUser.Id, otherScreening.Id);
    }

    protected override int IdOf(ReservationResponse response) => response.Id;

    protected override void AssertMatches(ReservationRequest expected, ReservationResponse actual) =>
        Assert.Equal(expected, new ReservationRequest(actual.UserId, actual.ScreeningId));

    [Fact]
    public async Task Create_SetsCreatedAtToNowInUtc()
    {
        var request = await NewRequestAsync();
        var before = DateTime.UtcNow;

        var created = await CreateAsync(request);

        Assert.Equal(DateTimeKind.Utc, created.CreatedAt.Kind);
        Assert.InRange(created.CreatedAt, before, DateTime.UtcNow);
    }

    [Fact]
    public async Task Create_UnknownUser_ReturnsBadRequest() =>
        await AssertCreateReturnsAsync(await NewRequestAsync() with { UserId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_WithoutUser_ReturnsValidationError()
    {
        var request = await NewRequestAsync();

        await AssertCreateWithJsonIsInvalidAsync(new { screeningId = request.ScreeningId }, "userId");
    }

    [Fact]
    public async Task Update_ChangingScreening_WithoutTickets_IsAccepted()
    {
        // Another reservation has tickets, not this one
        await SeedAsync(TestData.SeedReservationAsync);
        var request = await NewRequestAsync();
        var id = IdOf(await CreateAsync(request));
        var otherScreening = await SeedAsync(TestData.SeedScreeningAsync);

        await AssertUpdateReturnsAsync(id, request with { ScreeningId = otherScreening.Id }, HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_WithTickets_ForTheSameScreening_IsAccepted()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var otherUser = await SeedAsync(TestData.NewUser());

        await AssertUpdateReturnsAsync(
            reservation.Id, new ReservationRequest(otherUser.Id, reservation.ScreeningId), HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_ChangingScreening_WithTickets_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var otherScreening = await SeedAsync(TestData.SeedScreeningAsync);

        await AssertUpdateReturnsAsync(
            reservation.Id, new ReservationRequest(reservation.UserId, otherScreening.Id), HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_WithTickets_RemovesThemToo()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);

        await AssertDeleteReturnsAsync(reservation.Id, HttpStatusCode.NoContent);

        await using var context = Database.CreateContext();
        Assert.False(await context.Tickets.AnyAsync(t => t.ReservationId == reservation.Id));
    }
}
