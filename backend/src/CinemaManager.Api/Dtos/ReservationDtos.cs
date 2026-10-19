using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

/// <summary>A reservation to create or replace. Its creation time is set by the server.</summary>
/// <param name="UserId">User who books.</param>
/// <param name="ScreeningId">Screening booked.</param>
public record ReservationRequest(int UserId, int ScreeningId);

public record ReservationResponse(int Id, DateTime CreatedAt, int UserId, int ScreeningId)
{
    public static ReservationResponse From(Reservation reservation) =>
        new(reservation.Id, reservation.CreatedAt, reservation.UserId, reservation.ScreeningId);
}
