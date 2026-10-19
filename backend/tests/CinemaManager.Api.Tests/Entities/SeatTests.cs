using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class SeatTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToSeatTable() => Assert.Equal("Seat", TestData.TableOf<Seat>(database));

    [Fact]
    public void Row_IsLimitedTo5Characters() =>
        Assert.Equal(5, TestData.MaxLengthOf<Seat>(database, nameof(Seat.Row)));

    [Fact]
    public async Task IsUniquePerRoomRowAndNumber()
    {
        await using var context = database.CreateContext();
        var room = TestData.NewRoom();
        room.Seats.Add(new Seat { Row = "A", Number = 1 });
        room.Seats.Add(new Seat { Row = "A", Number = 1 });
        context.Rooms.Add(room);

        await TestData.AssertSaveFailsWithAsync(context, PostgresErrorCodes.UniqueViolation);
    }

    [Fact]
    public async Task IsPersistedWithItsRoomAndTickets()
    {
        await using var seedContext = database.CreateContext();
        var reservation = await TestData.SeedReservationAsync(seedContext);
        var seatId = reservation.Tickets.First().SeatId;

        await using var context = database.CreateContext();
        var seat = await context.Seats.Include(s => s.Room).Include(s => s.Tickets).SingleAsync(s => s.Id == seatId);

        Assert.Equal("A", seat.Row);
        Assert.Equal(reservation.Screening.RoomId, seat.Room.Id);
        Assert.Single(seat.Tickets);
    }

    [Fact]
    public async Task WithTickets_CannotBeDeleted()
    {
        await using var seedContext = database.CreateContext();
        var seatId = (await TestData.SeedReservationAsync(seedContext)).Tickets.First().SeatId;

        await TestData.AssertDeleteIsRestrictedAsync<Seat>(database, seatId);
    }
}
