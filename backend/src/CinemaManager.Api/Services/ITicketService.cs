using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface ITicketService
{
    Task<IReadOnlyList<TicketResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<TicketResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<TicketResponse> CreateAsync(TicketRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the ticket does not exist.</returns>
    Task<bool> UpdateAsync(int id, TicketRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the ticket does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
