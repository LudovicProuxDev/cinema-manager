using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class TicketsControllerTests(DatabaseFixture database)
    : CrudControllerTests<TicketRequest, TicketResponse>(database)
{
    private static readonly TicketRequest Valid = new(9.50m, ReservationId: 1, SeatId: 1);

    public static TheoryData<TicketRequest, string> InvalidRequests =>
        new()
        {
            { Valid with { Price = -1m }, nameof(TicketRequest.Price) },
            { Valid with { Price = 1_000_000m }, nameof(TicketRequest.Price) },
        };

    protected override string Route => "/tickets";

    // The seeded reservation already has a ticket for each seat of the room: add a free seat
    protected override async Task<TicketRequest> NewRequestAsync()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var freeSeat = await SeedAsync(new Seat { Row = "B", Number = 1, RoomId = reservation.Screening.RoomId });
        return Valid with { ReservationId = reservation.Id, SeatId = freeSeat.Id };
    }

    protected override Task<TicketRequest> ModifyAsync(TicketRequest request) =>
        Task.FromResult(request with { Price = 7m });

    protected override int IdOf(TicketResponse response) => response.Id;

    protected override void AssertMatches(TicketRequest expected, TicketResponse actual) =>
        Assert.Equal(expected, new TicketRequest(actual.Price, actual.ReservationId, actual.SeatId));

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(TicketRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public async Task Create_UnknownSeat_ReturnsBadRequest() =>
        await AssertCreateReturnsAsync(await NewRequestAsync() with { SeatId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_SeatAlreadyInTheReservation_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);
        var takenSeatId = reservation.Tickets.First().SeatId;

        await AssertCreateReturnsAsync(Valid with { ReservationId = reservation.Id, SeatId = takenSeatId }, HttpStatusCode.Conflict);
    }
}
