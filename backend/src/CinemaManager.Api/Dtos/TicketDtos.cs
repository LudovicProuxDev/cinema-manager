using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

// The price is not part of the request: it comes from the screening
public record TicketRequest(int ReservationId, int SeatId);

public record TicketResponse(int Id, decimal Price, int ReservationId, int SeatId)
{
    public static TicketResponse From(Ticket ticket) => new(ticket.Id, ticket.Price, ticket.ReservationId, ticket.SeatId);
}
