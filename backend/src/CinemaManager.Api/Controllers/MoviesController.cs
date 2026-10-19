using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class MoviesController(IMovieService movies) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<MovieResponse>> GetAll(CancellationToken cancellationToken) =>
        movies.GetAllAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var movie = await movies.GetByIdAsync(id, cancellationToken);
        return movie is null ? NotFound() : movie;
    }

    [HttpPost]
    public async Task<ActionResult<MovieResponse>> Create(MovieRequest request, CancellationToken cancellationToken)
    {
        var movie = await movies.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MovieRequest request, CancellationToken cancellationToken) =>
        await movies.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await movies.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
