using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class TicketTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToTicketTable() => Assert.Equal("Ticket", TestData.TableOf<Ticket>(database));

    [Fact]
    public async Task IsPersistedWithItsReservationAndSeat()
    {
        await using var seedContext = database.CreateContext();
        var ticketId = (await TestData.SeedReservationAsync(seedContext)).Tickets.First().Id;

        await using var context = database.CreateContext();
        var ticket = await context.Tickets.Include(t => t.Reservation).Include(t => t.Seat).SingleAsync(t => t.Id == ticketId);

        Assert.Equal(9.50m, ticket.Price);
        Assert.Equal(ticket.ReservationId, ticket.Reservation.Id);
        Assert.Equal(ticket.SeatId, ticket.Seat.Id);
    }

    [Fact]
    public async Task Price_IsStoredWithTwoDecimals()
    {
        await using var seedContext = database.CreateContext();
        var ticket = (await TestData.SeedReservationAsync(seedContext)).Tickets.First();
        ticket.Price = 7.125m;
        await seedContext.SaveChangesAsync();

        await using var context = database.CreateContext();

        Assert.Equal(7.13m, await context.Tickets.Where(t => t.Id == ticket.Id).Select(t => t.Price).SingleAsync());
    }

    [Fact]
    public async Task Seat_IsUniquePerReservation()
    {
        await using var context = database.CreateContext();
        var reservation = await TestData.SeedReservationAsync(context);
        reservation.Tickets.Add(new Ticket { Seat = reservation.Tickets.First().Seat, Price = 9.50m });

        await TestData.AssertSaveFailsWithAsync(context, PostgresErrorCodes.UniqueViolation);
    }
}
