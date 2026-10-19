using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class MovieTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToMovieTable() => Assert.Equal("Movie", TestData.TableOf<Movie>(database));

    [Fact]
    public async Task Title_IsLimitedTo200Characters()
    {
        await using var context = database.CreateContext();
        context.Movies.Add(new Movie { Title = new string('x', 201), DurationMinutes = 90 });

        await TestData.AssertSaveFailsWithAsync(context, PostgresErrorCodes.StringDataRightTruncation);
    }

    [Fact]
    public void Description_IsLimitedTo2000Characters() =>
        Assert.Equal(2000, TestData.MaxLengthOf<Movie>(database, nameof(Movie.Description)));

    [Fact]
    public async Task IsPersistedWithItsScreenings()
    {
        await using var seedContext = database.CreateContext();
        var movieId = (await TestData.SeedReservationAsync(seedContext)).Screening.MovieId;

        await using var context = database.CreateContext();
        var movie = await context.Movies.Include(m => m.Screenings).SingleAsync(m => m.Id == movieId);

        Assert.Equal("Inception", movie.Title);
        Assert.Equal(148, movie.DurationMinutes);
        Assert.Equal(new DateOnly(2010, 7, 16), movie.ReleaseDate);
        Assert.Single(movie.Screenings);
    }

    [Fact]
    public async Task WithScreenings_CannotBeDeleted()
    {
        await using var seedContext = database.CreateContext();
        var movieId = (await TestData.SeedReservationAsync(seedContext)).Screening.MovieId;

        // Reservations would also block the delete (through the screening): remove them so only the screening blocks it
        await using (var context = database.CreateContext())
        {
            await context.Reservations.Where(r => r.Screening.MovieId == movieId).ExecuteDeleteAsync();
        }

        await TestData.AssertDeleteIsRestrictedAsync<Movie>(database, movieId);
    }
}
