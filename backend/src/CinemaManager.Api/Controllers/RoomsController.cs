using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class RoomsController(IRoomService rooms) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<RoomResponse>> GetAll(CancellationToken cancellationToken) =>
        rooms.GetAllAsync(cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var room = await rooms.GetByIdAsync(id, cancellationToken);
        return room is null ? NotFound() : room;
    }

    [HttpPost]
    public async Task<ActionResult<RoomResponse>> Create(RoomRequest request, CancellationToken cancellationToken)
    {
        var room = await rooms.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RoomRequest request, CancellationToken cancellationToken) =>
        await rooms.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await rooms.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
