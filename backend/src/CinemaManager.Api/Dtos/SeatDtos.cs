using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record SeatRequest(
    [Required, MaxLength(5)] string Row,
    [Range(1, int.MaxValue)] int Number,
    int RoomId);

public record SeatResponse(int Id, string Row, int Number, int RoomId)
{
    public static SeatResponse From(Seat seat) => new(seat.Id, seat.Row, seat.Number, seat.RoomId);
}
