using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Tickets of a reservation, one per seat. The price is the price of the screening at the time of sale.</summary>
[ApiController]
[Route("[controller]")]
public class TicketsController(ITicketService tickets) : ControllerBase
{
    /// <summary>Lists all the tickets.</summary>
    [HttpGet]
    public Task<IReadOnlyList<TicketResponse>> GetAll(CancellationToken cancellationToken) =>
        tickets.GetAllAsync(cancellationToken);

    /// <summary>Gets a ticket.</summary>
    /// <response code="200">The ticket.</response>
    /// <response code="404">The ticket does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var ticket = await tickets.GetByIdAsync(id, cancellationToken);
        return ticket is null ? NotFound() : ticket;
    }

    /// <summary>Creates a ticket.</summary>
    /// <response code="201">The created ticket. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="409">The seat is not in the room of the screening, or is already booked for this screening.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TicketResponse>> Create(TicketRequest request, CancellationToken cancellationToken)
    {
        var ticket = await tickets.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    /// <summary>Replaces a ticket.</summary>
    /// <response code="204">The ticket is updated.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="404">The ticket does not exist.</response>
    /// <response code="409">The seat is not in the room of the screening, or is already booked for this screening.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, TicketRequest request, CancellationToken cancellationToken) =>
        await tickets.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a ticket.</summary>
    /// <response code="204">The ticket is deleted.</response>
    /// <response code="404">The ticket does not exist.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await tickets.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
