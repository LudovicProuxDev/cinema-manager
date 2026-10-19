using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using CinemaManager.Api.Errors;
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
        var screening = await ApplyAsync(request, ticket, cancellationToken);

        // The ticket keeps the price paid, even if the screening price changes later.
        // Unknown reservation: no price, the foreign key rejects the save anyway.
        ticket.Price = screening?.Price ?? 0m;
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

        await ApplyAsync(request, ticket, cancellationToken);
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

    /// <summary>Copies the request onto the ticket after checking the seat can be sold for the screening.</summary>
    /// <returns>The screening of the reservation, or <c>null</c> when the reservation or the seat does not exist.</returns>
    private async Task<Screening?> ApplyAsync(TicketRequest request, Ticket ticket, CancellationToken cancellationToken)
    {
        ticket.ReservationId = request.ReservationId;
        ticket.SeatId = request.SeatId;

        var screening = await db.Reservations
            .Where(r => r.Id == request.ReservationId)
            .Select(r => r.Screening)
            .SingleOrDefaultAsync(cancellationToken);
        var seat = await db.Seats.FindAsync([request.SeatId], cancellationToken);
        if (screening is null || seat is null)
        {
            // Unknown reservation or seat: the foreign keys reject the save (400)
            return screening;
        }

        if (seat.RoomId != screening.RoomId)
        {
            throw new BusinessRuleException("The seat is not in the room of the screening.");
        }

        var alreadyBooked = await db.Tickets.AnyAsync(
            t => t.Id != ticket.Id && t.SeatId == request.SeatId && t.Reservation.ScreeningId == screening.Id,
            cancellationToken);
        if (alreadyBooked)
        {
            throw new BusinessRuleException("The seat is already booked for this screening.");
        }

        return screening;
    }
}
