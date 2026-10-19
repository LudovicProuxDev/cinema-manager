using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class RoomTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToRoomTable() => Assert.Equal("Room", TestData.TableOf<Room>(database));

    [Fact]
    public void Name_IsLimitedTo50Characters() =>
        Assert.Equal(50, TestData.MaxLengthOf<Room>(database, nameof(Room.Name)));

    [Fact]
    public async Task Name_IsUnique()
    {
        await using var context = database.CreateContext();
        var name = TestData.NewRoom().Name;
        context.Rooms.Add(new Room { Name = name });
        context.Rooms.Add(new Room { Name = name });

        await TestData.AssertSaveFailsWithAsync(context, PostgresErrorCodes.UniqueViolation);
    }

    [Fact]
    public async Task IsPersistedWithItsSeatsAndScreenings()
    {
        await using var seedContext = database.CreateContext();
        var roomId = (await TestData.SeedReservationAsync(seedContext)).Screening.RoomId;

        await using var context = database.CreateContext();
        var room = await context.Rooms.Include(r => r.Seats).Include(r => r.Screenings).SingleAsync(r => r.Id == roomId);

        Assert.Equal(2, room.Seats.Count);
        Assert.Single(room.Screenings);
    }

    [Fact]
    public async Task Delete_CascadesToItsSeats()
    {
        int roomId;
        await using (var context = database.CreateContext())
        {
            var room = TestData.NewRoom();
            room.Seats.Add(new Seat { Row = "A", Number = 1 });
            context.Rooms.Add(room);
            await context.SaveChangesAsync();
            roomId = room.Id;
        }

        await using (var context = database.CreateContext())
        {
            context.Rooms.Remove(await context.Rooms.SingleAsync(r => r.Id == roomId));
            await context.SaveChangesAsync();
        }

        await using (var context = database.CreateContext())
        {
            Assert.False(await context.Seats.AnyAsync(s => s.RoomId == roomId));
        }
    }

    [Fact]
    public async Task WithScreenings_CannotBeDeleted()
    {
        await using var seedContext = database.CreateContext();
        var roomId = (await TestData.SeedScreeningAsync(seedContext)).RoomId;

        await TestData.AssertDeleteIsRestrictedAsync<Room>(database, roomId);
    }
}
