using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record ScreeningRequest(
    DateTime StartsAt,
    [Range(0, 999_999.99)] decimal Price,
    int MovieId,
    int RoomId);

public record ScreeningResponse(int Id, DateTime StartsAt, decimal Price, int MovieId, int RoomId)
{
    public static ScreeningResponse From(Screening screening) =>
        new(screening.Id, screening.StartsAt, screening.Price, screening.MovieId, screening.RoomId);
}
