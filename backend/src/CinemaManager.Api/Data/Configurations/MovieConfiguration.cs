using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemaManager.Api.Data.Configurations;

public class MovieConfiguration : IEntityTypeConfiguration<Movie>
{
    public void Configure(EntityTypeBuilder<Movie> builder)
    {
        builder.ToTable(nameof(Movie));

        builder.Property(m => m.Title).HasMaxLength(200);
        builder.Property(m => m.Description).HasMaxLength(2000);
    }
}
