using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Data;

public class CinemaDbContext(DbContextOptions<CinemaDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Picks up every IEntityTypeConfiguration<T> declared in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CinemaDbContext).Assembly);
    }
}
