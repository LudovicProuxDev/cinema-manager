using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface IReservationService
{
    Task<IReadOnlyList<ReservationResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<ReservationResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<ReservationResponse> CreateAsync(ReservationRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the reservation does not exist.</returns>
    Task<bool> UpdateAsync(int id, ReservationRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the reservation does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
