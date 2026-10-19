using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

/// <summary>A seat to create or replace. A row and number are unique within a room.</summary>
/// <param name="Row">Row, up to 5 characters, e.g. "A".</param>
/// <param name="Number">Number of the seat in its row, from 1.</param>
/// <param name="RoomId">Room of the seat.</param>
public record SeatRequest(
    [Required, MaxLength(5)] string Row,
    [Range(1, int.MaxValue)] int Number,
    int RoomId);

public record SeatResponse(int Id, string Row, int Number, int RoomId)
{
    public static SeatResponse From(Seat seat) => new(seat.Id, seat.Row, seat.Number, seat.RoomId);
}
