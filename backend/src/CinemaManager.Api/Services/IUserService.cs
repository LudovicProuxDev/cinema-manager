using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<UserResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<UserResponse> CreateAsync(UserRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the user does not exist.</returns>
    Task<bool> UpdateAsync(int id, UserRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the user does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
