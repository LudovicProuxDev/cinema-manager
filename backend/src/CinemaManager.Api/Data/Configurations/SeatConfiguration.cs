using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaManager.Api.Data.Configurations;

public class SeatConfiguration : IEntityTypeConfiguration<Seat>
{
    public void Configure(EntityTypeBuilder<Seat> builder)
    {
        builder.ToTable(nameof(Seat));

        builder.Property(s => s.Row).HasMaxLength(5);
        builder.HasIndex(s => new { s.RoomId, s.Row, s.Number }).IsUnique();

        builder.HasOne(s => s.Room)
            .WithMany(r => r.Seats)
            .HasForeignKey(s => s.RoomId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
