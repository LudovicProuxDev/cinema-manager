using CinemaManager.Api.Data;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Data;

/// <summary>Builders and assertions shared by the entity tests.</summary>
public static class TestData
{
    public static Room NewRoom() => new() { Name = $"Room {Guid.NewGuid():N}"[..30] };

    public static User NewUser(string? email = null) => new()
    {
        FirstName = "Ada",
        LastName = "Lovelace",
        Email = email ?? $"{Guid.NewGuid():N}@test.local",
    };

    public static Movie NewMovie() => new()
    {
        Title = "Inception",
        Description = "A thief who steals corporate secrets through dreams.",
        DurationMinutes = 148,
        ReleaseDate = new DateOnly(2010, 7, 16),
    };

    /// <summary>Saves a screening of a new movie in a new room with 2 seats (A1, A2), without reservations.</summary>
    public static async Task<Screening> SeedScreeningAsync(CinemaDbContext context)
    {
        var room = NewRoom();
        room.Seats.Add(new Seat { Row = "A", Number = 1 });
        room.Seats.Add(new Seat { Row = "A", Number = 2 });

        var screening = new Screening
        {
            Movie = NewMovie(),
            Room = room,
            StartsAt = new DateTime(2026, 11, 1, 20, 30, 0, DateTimeKind.Utc),
            Price = 9.50m,
        };

        context.Screenings.Add(screening);
        await context.SaveChangesAsync();
        return screening;
    }

    /// <summary>Saves a full graph: a seeded screening, a user, and a reservation with a ticket for each seat.</summary>
    public static async Task<Reservation> SeedReservationAsync(CinemaDbContext context)
    {
        var screening = await SeedScreeningAsync(context);
        var reservation = new Reservation { User = NewUser(), Screening = screening };
        foreach (var seat in screening.Room.Seats)
        {
            reservation.Tickets.Add(new Ticket { Seat = seat, Price = screening.Price });
        }

        context.Reservations.Add(reservation);
        await context.SaveChangesAsync();
        return reservation;
    }

    /// <summary>Asserts that SaveChanges is rejected by PostgreSQL with the given SQLSTATE.</summary>
    public static async Task AssertSaveFailsWithAsync(CinemaDbContext context, string sqlState)
    {
        var exception = await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        var postgresException = Assert.IsType<PostgresException>(exception.InnerException);
        Assert.Equal(sqlState, postgresException.SqlState);
    }

    /// <summary>Deletes an entity from a fresh context (nothing else tracked) and asserts PostgreSQL rejects it.</summary>
    public static async Task AssertDeleteIsRestrictedAsync<TEntity>(DatabaseFixture database, int id)
        where TEntity : class
    {
        await using var context = database.CreateContext();
        var entity = await context.Set<TEntity>().FindAsync(id);
        context.Remove(entity!);

        await AssertSaveFailsWithAsync(context, PostgresErrorCodes.ForeignKeyViolation);
    }

    public static int? MaxLengthOf<TEntity>(DatabaseFixture database, string property)
    {
        using var context = database.CreateContext();
        return context.Model.FindEntityType(typeof(TEntity))!.FindProperty(property)!.GetMaxLength();
    }

    public static string? TableOf<TEntity>(DatabaseFixture database)
    {
        using var context = database.CreateContext();
        return context.Model.FindEntityType(typeof(TEntity))!.GetTableName();
    }
}
