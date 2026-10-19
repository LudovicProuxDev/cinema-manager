using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class MovieService(CinemaDbContext db) : IMovieService
{
    public async Task<IReadOnlyList<MovieResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Movies.AsNoTracking()
            .OrderBy(m => m.Id)
            .Select(m => MovieResponse.From(m))
            .ToListAsync(cancellationToken);

    public async Task<MovieResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var movie = await db.Movies.FindAsync([id], cancellationToken);
        return movie is null ? null : MovieResponse.From(movie);
    }

    public async Task<MovieResponse> CreateAsync(MovieRequest request, CancellationToken cancellationToken)
    {
        var movie = new Movie();
        Apply(request, movie);
        db.Movies.Add(movie);
        await db.SaveChangesAsync(cancellationToken);
        return MovieResponse.From(movie);
    }

    public async Task<bool> UpdateAsync(int id, MovieRequest request, CancellationToken cancellationToken)
    {
        var movie = await db.Movies.FindAsync([id], cancellationToken);
        if (movie is null)
        {
            return false;
        }

        Apply(request, movie);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var movie = await db.Movies.FindAsync([id], cancellationToken);
        if (movie is null)
        {
            return false;
        }

        db.Movies.Remove(movie);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(MovieRequest request, Movie movie)
    {
        movie.Title = request.Title;
        movie.Description = request.Description;
        movie.DurationMinutes = request.DurationMinutes;
        movie.ReleaseDate = request.ReleaseDate;
    }
}
