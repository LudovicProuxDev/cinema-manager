using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

/// <summary>A movie to create or replace. Every field is required, except the description.</summary>
/// <param name="Title">Title, up to 200 characters.</param>
/// <param name="DurationMinutes">Duration, in minutes.</param>
/// <param name="ReleaseDate">Release date, e.g. 2010-07-16.</param>
/// <param name="Description">Optional synopsis, up to 2000 characters.</param>
// Description is optional, so it has a default value (and comes last)
public record MovieRequest(
    [Required, MaxLength(200)] string Title,
    [Range(1, int.MaxValue)] int DurationMinutes,
    DateOnly ReleaseDate,
    [MaxLength(2000)] string? Description = null);

public record MovieResponse(int Id, string Title, string? Description, int DurationMinutes, DateOnly ReleaseDate)
{
    public static MovieResponse From(Movie movie) =>
        new(movie.Id, movie.Title, movie.Description, movie.DurationMinutes, movie.ReleaseDate);
}
