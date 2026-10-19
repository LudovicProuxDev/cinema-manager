using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class ScreeningsController(IScreeningService screenings) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ScreeningResponse>> GetAll(CancellationToken cancellationToken) =>
        screenings.GetAllAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ScreeningResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var screening = await screenings.GetByIdAsync(id, cancellationToken);
        return screening is null ? NotFound() : screening;
    }

    [HttpPost]
    public async Task<ActionResult<ScreeningResponse>> Create(ScreeningRequest request, CancellationToken cancellationToken)
    {
        var screening = await screenings.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = screening.Id }, screening);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ScreeningRequest request, CancellationToken cancellationToken) =>
        await screenings.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await screenings.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
