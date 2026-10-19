using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class ReservationsController(IReservationService reservations) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ReservationResponse>> GetAll(CancellationToken cancellationToken) =>
        reservations.GetAllAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var reservation = await reservations.GetByIdAsync(id, cancellationToken);
        return reservation is null ? NotFound() : reservation;
    }

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> Create(ReservationRequest request, CancellationToken cancellationToken)
    {
        var reservation = await reservations.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = reservation.Id }, reservation);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ReservationRequest request, CancellationToken cancellationToken) =>
        await reservations.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await reservations.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
