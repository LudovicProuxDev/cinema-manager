using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record ScreeningRequest(
    DateTime StartsAt,
    [Range(0, 999_999.99)] decimal Price,
    int MovieId,
    int RoomId) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Without "Z" or an offset, the time would depend on the server's time zone
        if (StartsAt.Kind == DateTimeKind.Unspecified)
        {
            yield return new ValidationResult(
                "The start time must include a time zone, e.g. '2026-11-01T20:30:00Z' or '2026-11-01T21:30:00+01:00'.",
                [nameof(StartsAt)]);
        }
    }
}

public record ScreeningResponse(int Id, DateTime StartsAt, decimal Price, int MovieId, int RoomId)
{
    public static ScreeningResponse From(Screening screening) =>
        new(screening.Id, screening.StartsAt, screening.Price, screening.MovieId, screening.RoomId);
}
