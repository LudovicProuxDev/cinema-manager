using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class TicketsControllerTests(DatabaseFixture database)
    : CrudControllerTests<TicketRequest, TicketResponse>(database)
{
    protected override string Route => "/tickets";

    // The seeded reservation already has a ticket for each seat of the room: add a free seat
    protected override async Task<TicketRequest> NewRequestAsync()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var freeSeat = await SeedAsync(new Seat { Row = "B", Number = 1, RoomId = reservation.Screening.RoomId });
        return new TicketRequest(reservation.Id, freeSeat.Id);
    }

    protected override async Task<TicketRequest> ModifyAsync(TicketRequest request)
    {
        await using var context = Database.CreateContext();
        var roomId = (await context.Seats.FindAsync(request.SeatId))!.RoomId;
        var otherFreeSeat = await SeedAsync(new Seat { Row = "B", Number = 2, RoomId = roomId });
        return request with { SeatId = otherFreeSeat.Id };
    }

    protected override int IdOf(TicketResponse response) => response.Id;

    protected override void AssertMatches(TicketRequest expected, TicketResponse actual) =>
        Assert.Equal(expected, new TicketRequest(actual.ReservationId, actual.SeatId));

    [Fact]
    public async Task Create_TakesThePriceOfTheScreening()
    {
        var created = await CreateAsync(await NewRequestAsync());

        Assert.Equal(9.50m, created.Price);
    }

    [Fact]
    public Task Create_WithoutSeat_ReturnsValidationError() =>
        AssertCreateWithJsonIsInvalidAsync(new { reservationId = 1 }, "seatId");

    [Fact]
    public async Task Create_UnknownSeat_ReturnsBadRequest() =>
        await AssertCreateReturnsAsync(await NewRequestAsync() with { SeatId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_UnknownReservation_ReturnsBadRequest() =>
        await AssertCreateReturnsAsync(await NewRequestAsync() with { ReservationId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_SeatAlreadyInTheReservation_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var takenSeatId = reservation.Tickets.First().SeatId;

        await AssertCreateReturnsAsync(new TicketRequest(reservation.Id, takenSeatId), HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Update_KeepingItsSeat_IsAccepted()
    {
        var ticket = (await SeedAsync(TestData.SeedReservationAsync)).Tickets.First();

        // Its own seat is booked by... itself: that must not count as a double booking
        await AssertUpdateReturnsAsync(ticket.Id, new TicketRequest(ticket.ReservationId, ticket.SeatId), HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Create_SeatAlreadyBookedForTheScreening_ReturnsConflict()
    {
        var booked = await SeedAsync(TestData.SeedReservationAsync);
        var otherReservation = await SeedAsync(new Reservation { User = TestData.NewUser(), ScreeningId = booked.ScreeningId });

        await AssertCreateReturnsAsync(
            new TicketRequest(otherReservation.Id, booked.Tickets.First().SeatId), HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Create_SeatFromAnotherRoom_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var otherRoom = TestData.NewRoom();
        otherRoom.Seats.Add(new Seat { Row = "A", Number = 1 });
        await SeedAsync(otherRoom);

        await AssertCreateReturnsAsync(
            new TicketRequest(reservation.Id, otherRoom.Seats.First().Id), HttpStatusCode.Conflict);
    }
}
