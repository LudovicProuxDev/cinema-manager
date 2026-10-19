using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

// CreatedAt is set by the server, so it is not part of the request
public record ReservationRequest(int UserId, int ScreeningId);

public record ReservationResponse(int Id, DateTime CreatedAt, int UserId, int ScreeningId)
{
    public static ReservationResponse From(Reservation reservation) =>
        new(reservation.Id, reservation.CreatedAt, reservation.UserId, reservation.ScreeningId);
}
