using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaManager.Api.Data.Configurations;

public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
{
    public void Configure(EntityTypeBuilder<Ticket> builder)
    {
        builder.ToTable(nameof(Ticket));

        builder.Property(t => t.Price).HasPrecision(8, 2);
        builder.HasIndex(t => new { t.ReservationId, t.SeatId }).IsUnique();

        builder.HasOne(t => t.Reservation)
            .WithMany(r => r.Tickets)
            .HasForeignKey(t => t.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Seat)
            .WithMany(s => s.Tickets)
            .HasForeignKey(t => t.SeatId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
