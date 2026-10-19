using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record TicketRequest(
    [Range(0, 999_999.99)] decimal Price,
    int ReservationId,
    int SeatId);

public record TicketResponse(int Id, decimal Price, int ReservationId, int SeatId)
{
    public static TicketResponse From(Ticket ticket) => new(ticket.Id, ticket.Price, ticket.ReservationId, ticket.SeatId);
}
