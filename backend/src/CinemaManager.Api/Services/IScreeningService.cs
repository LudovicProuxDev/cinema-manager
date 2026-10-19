using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface IScreeningService
{
    Task<IReadOnlyList<ScreeningResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<ScreeningResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<ScreeningResponse> CreateAsync(ScreeningRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the screening does not exist.</returns>
    Task<bool> UpdateAsync(int id, ScreeningRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the screening does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
