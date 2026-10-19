namespace CinemaManager.Api.Entities;

public class Screening
{
    public int Id { get; set; }
    public DateTime StartsAt { get; set; }
    public decimal Price { get; set; }

    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public ICollection<Reservation> Reservations { get; set; } = [];
}
