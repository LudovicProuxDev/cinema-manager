using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

// Every field is required in the JSON, except Description: optional, so it has a default value (and comes last)
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
