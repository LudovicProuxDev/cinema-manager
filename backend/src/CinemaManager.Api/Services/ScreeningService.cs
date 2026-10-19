using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Errors;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class ScreeningService(CinemaDbContext db) : IScreeningService
{
    public async Task<IReadOnlyList<ScreeningResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Screenings.AsNoTracking()
            .OrderBy(s => s.Id)
            .Select(s => ScreeningResponse.From(s))
            .ToListAsync(cancellationToken);

    public async Task<ScreeningResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var screening = await db.Screenings.FindAsync([id], cancellationToken);
        return screening is null ? null : ScreeningResponse.From(screening);
    }

    public async Task<ScreeningResponse> CreateAsync(ScreeningRequest request, CancellationToken cancellationToken)
    {
        var screening = new Screening();
        Apply(request, screening);
        db.Screenings.Add(screening);
        await db.SaveChangesAsync(cancellationToken);
        return ScreeningResponse.From(screening);
    }

    public async Task<bool> UpdateAsync(int id, ScreeningRequest request, CancellationToken cancellationToken)
    {
        var screening = await db.Screenings.FindAsync([id], cancellationToken);
        if (screening is null)
        {
            return false;
        }

        // Existing tickets must stay on a seat of the screening's room
        if (screening.RoomId != request.RoomId
            && await db.Tickets.AnyAsync(t => t.Reservation.ScreeningId == id, cancellationToken))
        {
            throw new BusinessRuleException("The screening cannot change room: tickets are sold for it.");
        }

        Apply(request, screening);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var screening = await db.Screenings.FindAsync([id], cancellationToken);
        if (screening is null)
        {
            return false;
        }

        db.Screenings.Remove(screening);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(ScreeningRequest request, Screening screening)
    {
        // PostgreSQL stores timestamps in UTC: convert a time sent with an offset
        screening.StartsAt = request.StartsAt.ToUniversalTime();
        screening.Price = request.Price;
        screening.MovieId = request.MovieId;
        screening.RoomId = request.RoomId;
    }
}
