using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaManager.Api.Data.Configurations;

public class ScreeningConfiguration : IEntityTypeConfiguration<Screening>
{
    public void Configure(EntityTypeBuilder<Screening> builder)
    {
        builder.ToTable(nameof(Screening));

        builder.Property(s => s.Price).HasPrecision(8, 2);

        builder.HasOne(s => s.Movie)
            .WithMany(m => m.Screenings)
            .HasForeignKey(s => s.MovieId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Room)
            .WithMany(r => r.Screenings)
            .HasForeignKey(s => s.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
