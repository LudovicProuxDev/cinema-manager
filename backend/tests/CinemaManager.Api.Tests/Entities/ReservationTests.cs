using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class ReservationTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToReservationTable() => Assert.Equal("Reservation", TestData.TableOf<Reservation>(database));

    [Fact]
    public void CreatedAt_DefaultsToNowInUtc()
    {
        var before = DateTime.UtcNow;

        var reservation = new Reservation();

        Assert.Equal(DateTimeKind.Utc, reservation.CreatedAt.Kind);
        Assert.InRange(reservation.CreatedAt, before, DateTime.UtcNow);
    }

    [Fact]
    public async Task IsPersistedWithItsUserScreeningAndTickets()
    {
        await using var seedContext = database.CreateContext();
        var reservationId = (await TestData.SeedReservationAsync(seedContext)).Id;

        await using var context = database.CreateContext();
        var reservation = await context.Reservations
            .Include(r => r.User)
            .Include(r => r.Screening)
            .Include(r => r.Tickets).ThenInclude(t => t.Seat)
            .SingleAsync(r => r.Id == reservationId);

        Assert.Equal("Ada", reservation.User.FirstName);
        Assert.Equal(9.50m, reservation.Screening.Price);
        Assert.Equal(2, reservation.Tickets.Count);
        Assert.All(reservation.Tickets, t => Assert.Equal(reservation.Screening.RoomId, t.Seat.RoomId));
    }

    [Fact]
    public async Task Delete_CascadesToItsTickets()
    {
        await using var seedContext = database.CreateContext();
        var reservationId = (await TestData.SeedReservationAsync(seedContext)).Id;

        await using (var context = database.CreateContext())
        {
            context.Reservations.Remove(await context.Reservations.SingleAsync(r => r.Id == reservationId));
            await context.SaveChangesAsync();
        }

        await using (var context = database.CreateContext())
        {
            Assert.False(await context.Tickets.AnyAsync(t => t.ReservationId == reservationId));
        }
    }
}
