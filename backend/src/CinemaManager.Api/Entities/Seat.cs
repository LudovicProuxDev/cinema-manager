namespace CinemaManager.Api.Entities;

public class Seat
{
    public int Id { get; set; }
    public string Row { get; set; } = string.Empty;
    public int Number { get; set; }

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public ICollection<Ticket> Tickets { get; set; } = [];
}
