using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class SeatService(CinemaDbContext db) : ISeatService
{
    public async Task<IReadOnlyList<SeatResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Seats.AsNoTracking()
            .OrderBy(s => s.Id)
            .Select(s => SeatResponse.From(s))
            .ToListAsync(cancellationToken);

    public async Task<SeatResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var seat = await db.Seats.FindAsync([id], cancellationToken);
        return seat is null ? null : SeatResponse.From(seat);
    }

    public async Task<SeatResponse> CreateAsync(SeatRequest request, CancellationToken cancellationToken)
    {
        var seat = new Seat();
        Apply(request, seat);
        db.Seats.Add(seat);
        await db.SaveChangesAsync(cancellationToken);
        return SeatResponse.From(seat);
    }

    public async Task<bool> UpdateAsync(int id, SeatRequest request, CancellationToken cancellationToken)
    {
        var seat = await db.Seats.FindAsync([id], cancellationToken);
        if (seat is null)
        {
            return false;
        }

        Apply(request, seat);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var seat = await db.Seats.FindAsync([id], cancellationToken);
        if (seat is null)
        {
            return false;
        }

        db.Seats.Remove(seat);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(SeatRequest request, Seat seat)
    {
        seat.Row = request.Row;
        seat.Number = request.Number;
        seat.RoomId = request.RoomId;
    }
}
