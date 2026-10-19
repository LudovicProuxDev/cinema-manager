using CinemaManager.Api.Dtos;

namespace CinemaManager.Api.Services;

public interface IMovieService
{
    Task<IReadOnlyList<MovieResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<MovieResponse?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<MovieResponse> CreateAsync(MovieRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the movie does not exist.</returns>
    Task<bool> UpdateAsync(int id, MovieRequest request, CancellationToken cancellationToken);

    /// <returns><c>false</c> when the movie does not exist.</returns>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
