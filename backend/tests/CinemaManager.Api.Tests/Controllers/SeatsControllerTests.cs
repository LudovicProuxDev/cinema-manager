using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class SeatsControllerTests(DatabaseFixture database)
    : CrudControllerTests<SeatRequest, SeatResponse>(database)
{
    private static readonly SeatRequest Valid = new("A", 1, RoomId: 1);

    public static TheoryData<SeatRequest, string> InvalidRequests =>
        new()
        {
            { Valid with { Row = "" }, nameof(SeatRequest.Row) },
            { Valid with { Row = "ABCDEF" }, nameof(SeatRequest.Row) },
            { Valid with { Number = 0 }, nameof(SeatRequest.Number) },
        };

    protected override string Route => "/seats";

    protected override async Task<SeatRequest> NewRequestAsync()
    {
        var room = await SeedAsync(TestData.NewRoom());
        return Valid with { RoomId = room.Id };
    }

    // Moving to another room is allowed as long as no ticket is sold for the seat
    protected override async Task<SeatRequest> ModifyAsync(SeatRequest request)
    {
        var otherRoom = await SeedAsync(TestData.NewRoom());
        return request with { Row = "B", Number = 7, RoomId = otherRoom.Id };
    }

    protected override int IdOf(SeatResponse response) => response.Id;

    protected override void AssertMatches(SeatRequest expected, SeatResponse actual) =>
        Assert.Equal(expected, new SeatRequest(actual.Row, actual.Number, actual.RoomId));

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(SeatRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public Task Create_UnknownRoom_ReturnsBadRequest() =>
        AssertCreateReturnsAsync(Valid with { RoomId = UnknownId }, HttpStatusCode.BadRequest);

    [Fact]
    public async Task Create_SameSeatTwiceInARoom_ReturnsConflict()
    {
        var request = await NewRequestAsync();
        await CreateAsync(request);

        await AssertCreateReturnsAsync(request, HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Update_ChangingRoom_WithoutTickets_IsAccepted()
    {
        // Tickets are sold for the other seats of the room, not for this one
        var roomId = (await SeedAsync(TestData.SeedReservationAsync)).Screening.RoomId;
        var freeSeat = await SeedAsync(new Seat { Row = "B", Number = 1, RoomId = roomId });
        var otherRoom = await SeedAsync(TestData.NewRoom());

        await AssertUpdateReturnsAsync(freeSeat.Id, new SeatRequest("B", 1, otherRoom.Id), HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_WithTicketsSold_InTheSameRoom_IsAccepted()
    {
        var seat = (await SeedAsync(TestData.SeedReservationAsync)).Tickets.First().Seat;

        await AssertUpdateReturnsAsync(seat.Id, new SeatRequest("Z", 99, seat.RoomId), HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Update_ChangingRoom_WithTicketsSold_ReturnsConflict()
    {
        var seat = (await SeedAsync(TestData.SeedReservationAsync)).Tickets.First().Seat;
        var otherRoom = await SeedAsync(TestData.NewRoom());

        await AssertUpdateReturnsAsync(seat.Id, new SeatRequest(seat.Row, seat.Number, otherRoom.Id), HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_WithTickets_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);

        await AssertDeleteReturnsAsync(reservation.Tickets.First().SeatId, HttpStatusCode.Conflict);
    }
}
