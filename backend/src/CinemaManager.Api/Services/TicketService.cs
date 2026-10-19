using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class TicketService(CinemaDbContext db) : ITicketService
{
    public async Task<IReadOnlyList<TicketResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Tickets.AsNoTracking()
            .OrderBy(t => t.Id)
            .Select(t => TicketResponse.From(t))
            .ToListAsync(cancellationToken);

    public async Task<TicketResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        return ticket is null ? null : TicketResponse.From(ticket);
    }

    public async Task<TicketResponse> CreateAsync(TicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = new Ticket();
        Apply(request, ticket);
        db.Tickets.Add(ticket);
        await db.SaveChangesAsync(cancellationToken);
        return TicketResponse.From(ticket);
    }

    public async Task<bool> UpdateAsync(int id, TicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        if (ticket is null)
        {
            return false;
        }

        Apply(request, ticket);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var ticket = await db.Tickets.FindAsync([id], cancellationToken);
        if (ticket is null)
        {
            return false;
        }

        db.Tickets.Remove(ticket);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(TicketRequest request, Ticket ticket)
    {
        ticket.Price = request.Price;
        ticket.ReservationId = request.ReservationId;
        ticket.SeatId = request.SeatId;
    }
}
