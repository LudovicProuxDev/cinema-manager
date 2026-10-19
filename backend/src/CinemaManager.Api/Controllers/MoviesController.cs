using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Movies shown by the cinema.</summary>
[ApiController]
[Route("[controller]")]
public class MoviesController(IMovieService movies) : ControllerBase
{
    /// <summary>Lists all the movies.</summary>
    [HttpGet]
    public Task<IReadOnlyList<MovieResponse>> GetAll(CancellationToken cancellationToken) =>
        movies.GetAllAsync(cancellationToken);

    /// <summary>Gets a movie.</summary>
    /// <response code="200">The movie.</response>
    /// <response code="404">The movie does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MovieResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var movie = await movies.GetByIdAsync(id, cancellationToken);
        return movie is null ? NotFound() : movie;
    }

    /// <summary>Creates a movie.</summary>
    /// <response code="201">The created movie. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MovieResponse>> Create(MovieRequest request, CancellationToken cancellationToken)
    {
        var movie = await movies.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    /// <summary>Replaces a movie.</summary>
    /// <response code="204">The movie is updated.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="404">The movie does not exist.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, MovieRequest request, CancellationToken cancellationToken) =>
        await movies.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a movie.</summary>
    /// <response code="204">The movie is deleted.</response>
    /// <response code="404">The movie does not exist.</response>
    /// <response code="409">The movie still has screenings.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await movies.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
