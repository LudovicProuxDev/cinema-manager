using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class SeatsController(ISeatService seats) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<SeatResponse>> GetAll(CancellationToken cancellationToken) =>
        seats.GetAllAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SeatResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var seat = await seats.GetByIdAsync(id, cancellationToken);
        return seat is null ? NotFound() : seat;
    }

    [HttpPost]
    public async Task<ActionResult<SeatResponse>> Create(SeatRequest request, CancellationToken cancellationToken)
    {
        var seat = await seats.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = seat.Id }, seat);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SeatRequest request, CancellationToken cancellationToken) =>
        await seats.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await seats.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
