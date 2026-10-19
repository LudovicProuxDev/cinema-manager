using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Screenings of a movie in a room, at a given time and price.</summary>
[ApiController]
[Route("[controller]")]
public class ScreeningsController(IScreeningService screenings) : ControllerBase
{
    /// <summary>Lists all the screenings.</summary>
    [HttpGet]
    public Task<IReadOnlyList<ScreeningResponse>> GetAll(CancellationToken cancellationToken) =>
        screenings.GetAllAsync(cancellationToken);

    /// <summary>Gets a screening.</summary>
    /// <response code="200">The screening.</response>
    /// <response code="404">The screening does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ScreeningResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var screening = await screenings.GetByIdAsync(id, cancellationToken);
        return screening is null ? NotFound() : screening;
    }

    /// <summary>Creates a screening.</summary>
    /// <response code="201">The created screening. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ScreeningResponse>> Create(ScreeningRequest request, CancellationToken cancellationToken)
    {
        var screening = await screenings.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = screening.Id }, screening);
    }

    /// <summary>Replaces a screening.</summary>
    /// <response code="204">The screening is updated.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="404">The screening does not exist.</response>
    /// <response code="409">The screening changes room while tickets are sold for it.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, ScreeningRequest request, CancellationToken cancellationToken) =>
        await screenings.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a screening.</summary>
    /// <response code="204">The screening is deleted.</response>
    /// <response code="404">The screening does not exist.</response>
    /// <response code="409">The screening still has reservations.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await screenings.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
