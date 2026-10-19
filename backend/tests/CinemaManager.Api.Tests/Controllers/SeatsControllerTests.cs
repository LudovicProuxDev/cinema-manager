using System.Net;
using CinemaManager.Api.Dtos;
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

    protected override Task<SeatRequest> ModifyAsync(SeatRequest request) =>
        Task.FromResult(request with { Row = "B", Number = 7 });

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
    public async Task Delete_WithTickets_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);

        await AssertDeleteReturnsAsync(reservation.Tickets.First().SeatId, HttpStatusCode.Conflict);
    }
}
