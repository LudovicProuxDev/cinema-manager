using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Seats of a room, identified by their row and number.</summary>
[ApiController]
[Route("[controller]")]
public class SeatsController(ISeatService seats) : ControllerBase
{
    /// <summary>Lists all the seats.</summary>
    [HttpGet]
    public Task<IReadOnlyList<SeatResponse>> GetAll(CancellationToken cancellationToken) =>
        seats.GetAllAsync(cancellationToken);

    /// <summary>Gets a seat.</summary>
    /// <response code="200">The seat.</response>
    /// <response code="404">The seat does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SeatResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var seat = await seats.GetByIdAsync(id, cancellationToken);
        return seat is null ? NotFound() : seat;
    }

    /// <summary>Creates a seat.</summary>
    /// <response code="201">The created seat. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="409">This seat already exists in the room.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SeatResponse>> Create(SeatRequest request, CancellationToken cancellationToken)
    {
        var seat = await seats.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = seat.Id }, seat);
    }

    /// <summary>Replaces a seat.</summary>
    /// <response code="204">The seat is updated.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="404">The seat does not exist.</response>
    /// <response code="409">This seat already exists in the room, or the seat changes room while tickets are sold for it.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, SeatRequest request, CancellationToken cancellationToken) =>
        await seats.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a seat.</summary>
    /// <response code="204">The seat is deleted.</response>
    /// <response code="404">The seat does not exist.</response>
    /// <response code="409">Tickets are sold for the seat.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await seats.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
