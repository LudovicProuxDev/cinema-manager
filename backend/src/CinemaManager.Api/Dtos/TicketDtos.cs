using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

/// <summary>A ticket to create or replace. Its price comes from the screening.</summary>
/// <param name="ReservationId">Reservation the ticket belongs to.</param>
/// <param name="SeatId">Seat booked: in the room of the screening, and not already booked for it.</param>
public record TicketRequest(int ReservationId, int SeatId);

public record TicketResponse(int Id, decimal Price, int ReservationId, int SeatId)
{
    public static TicketResponse From(Ticket ticket) => new(ticket.Id, ticket.Price, ticket.ReservationId, ticket.SeatId);
}
