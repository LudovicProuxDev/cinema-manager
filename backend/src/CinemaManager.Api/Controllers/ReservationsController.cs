using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Reservations of a user for a screening. Deleting a reservation deletes its tickets.</summary>
[ApiController]
[Route("[controller]")]
public class ReservationsController(IReservationService reservations) : ControllerBase
{
    /// <summary>Lists all the reservations.</summary>
    [HttpGet]
    public Task<IReadOnlyList<ReservationResponse>> GetAll(CancellationToken cancellationToken) =>
        reservations.GetAllAsync(cancellationToken);

    /// <summary>Gets a reservation.</summary>
    /// <response code="200">The reservation.</response>
    /// <response code="404">The reservation does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReservationResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var reservation = await reservations.GetByIdAsync(id, cancellationToken);
        return reservation is null ? NotFound() : reservation;
    }

    /// <summary>Creates a reservation.</summary>
    /// <response code="201">The created reservation. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReservationResponse>> Create(ReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = await reservations.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
    }

    /// <summary>Replaces a reservation.</summary>
    /// <response code="204">The reservation is updated.</response>
    /// <response code="400">The request is invalid or references a resource that does not exist.</response>
    /// <response code="404">The reservation does not exist.</response>
    /// <response code="409">The reservation changes screening while it has tickets.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, ReservationRequest request, CancellationToken cancellationToken) =>
        await reservations.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a reservation.</summary>
    /// <response code="204">The reservation is deleted.</response>
    /// <response code="404">The reservation does not exist.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await reservations.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
