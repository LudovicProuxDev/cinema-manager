using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record MovieRequest(
    [Required, MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    [Range(1, int.MaxValue)] int DurationMinutes,
    DateOnly ReleaseDate);

public record MovieResponse(int Id, string Title, string? Description, int DurationMinutes, DateOnly ReleaseDate)
{
    public static MovieResponse From(Movie movie) =>
        new(movie.Id, movie.Title, movie.Description, movie.DurationMinutes, movie.ReleaseDate);
}
