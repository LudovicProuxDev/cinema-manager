using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Errors;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class ReservationService(CinemaDbContext db) : IReservationService
{
    public async Task<IReadOnlyList<ReservationResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Reservations.AsNoTracking()
            .OrderBy(r => r.Id)
            .Select(r => ReservationResponse.From(r))
            .ToListAsync(cancellationToken);

    public async Task<ReservationResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var reservation = await db.Reservations.FindAsync([id], cancellationToken);
        return reservation is null ? null : ReservationResponse.From(reservation);
    }

    public async Task<ReservationResponse> CreateAsync(ReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = new Reservation();
        Apply(request, reservation);
        db.Reservations.Add(reservation);
        await db.SaveChangesAsync(cancellationToken);
        return ReservationResponse.From(reservation);
    }

    public async Task<bool> UpdateAsync(int id, ReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = await db.Reservations.FindAsync([id], cancellationToken);
        if (reservation is null)
        {
            return false;
        }

        // Existing tickets must stay on a seat of the screening's room
        if (reservation.ScreeningId != request.ScreeningId
            && await db.Tickets.AnyAsync(t => t.ReservationId == id, cancellationToken))
        {
            throw new BusinessRuleException("The reservation cannot change screening: it has tickets.");
        }

        Apply(request, reservation);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var reservation = await db.Reservations.FindAsync([id], cancellationToken);
        if (reservation is null)
        {
            return false;
        }

        db.Reservations.Remove(reservation);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(ReservationRequest request, Reservation reservation)
    {
        reservation.UserId = request.UserId;
        reservation.ScreeningId = request.ScreeningId;
    }
}
