using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class ScreeningTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToScreeningTable() => Assert.Equal("Screening", TestData.TableOf<Screening>(database));

    [Fact]
    public async Task IsPersistedWithItsMovieRoomAndReservations()
    {
        await using var seedContext = database.CreateContext();
        var screeningId = (await TestData.SeedReservationAsync(seedContext)).ScreeningId;

        await using var context = database.CreateContext();
        var screening = await context.Screenings
            .Include(s => s.Movie)
            .Include(s => s.Room)
            .Include(s => s.Reservations)
            .SingleAsync(s => s.Id == screeningId);

        Assert.Equal("Inception", screening.Movie.Title);
        Assert.StartsWith("Room", screening.Room.Name);
        Assert.Equal(new DateTime(2026, 11, 1, 20, 30, 0, DateTimeKind.Utc), screening.StartsAt);
        Assert.Single(screening.Reservations);
    }

    [Fact]
    public async Task Price_IsStoredWithTwoDecimals()
    {
        await using var seedContext = database.CreateContext();
        var screening = (await TestData.SeedReservationAsync(seedContext)).Screening;
        screening.Price = 9.999m;
        await seedContext.SaveChangesAsync();

        await using var context = database.CreateContext();

        Assert.Equal(10.00m, await context.Screenings.Where(s => s.Id == screening.Id).Select(s => s.Price).SingleAsync());
    }

    [Fact]
    public async Task WithReservations_CannotBeDeleted()
    {
        await using var seedContext = database.CreateContext();
        var screeningId = (await TestData.SeedReservationAsync(seedContext)).ScreeningId;

        await TestData.AssertDeleteIsRestrictedAsync<Screening>(database, screeningId);
    }
}
