namespace CinemaManager.Api.Entities;

public class Movie
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationMinutes { get; set; }
    public DateOnly ReleaseDate { get; set; }

    public ICollection<Screening> Screenings { get; set; } = [];
}
