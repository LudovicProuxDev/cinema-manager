using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface ISeatService
{
    Task<IReadOnlyList<SeatResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<SeatResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<SeatResponse> CreateAsync(SeatRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the seat does not exist.</returns>
    Task<bool> UpdateAsync(int id, SeatRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the seat does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
