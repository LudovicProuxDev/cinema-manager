namespace CinemaManager.Api.Entities;

public class Reservation
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ScreeningId { get; set; }
    public Screening Screening { get; set; } = null!;

    public ICollection<Ticket> Tickets { get; set; } = [];
}
