using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface IRoomService
{
    Task<IReadOnlyList<RoomResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<RoomResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<RoomResponse> CreateAsync(RoomRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the room does not exist.</returns>
    Task<bool> UpdateAsync(int id, RoomRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the room does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
