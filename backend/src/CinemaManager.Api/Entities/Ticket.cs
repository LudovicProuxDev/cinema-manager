namespace CinemaManager.Api.Entities;

public class Ticket
{
    public int Id { get; set; }
    public decimal Price { get; set; }

    public int ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;

    public int SeatId { get; set; }
    public Seat Seat { get; set; } = null!;
}
