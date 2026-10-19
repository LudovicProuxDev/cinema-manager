namespace CinemaManager.Api.Entities;

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Seat> Seats { get; set; } = [];
    public ICollection<Screening> Screenings { get; set; } = [];
}
