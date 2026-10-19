using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Rooms of the cinema. Deleting a room deletes its seats.</summary>
[ApiController]
[Route("[controller]")]
public class RoomsController(IRoomService rooms) : ControllerBase
{
    /// <summary>Lists all the rooms.</summary>
    [HttpGet]
    public Task<IReadOnlyList<RoomResponse>> GetAll(CancellationToken cancellationToken) =>
        rooms.GetAllAsync(cancellationToken);

    /// <summary>Gets a room.</summary>
    /// <response code="200">The room.</response>
    /// <response code="404">The room does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RoomResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var room = await rooms.GetByIdAsync(id, cancellationToken);
        return room is null ? NotFound() : room;
    }

    /// <summary>Creates a room.</summary>
    /// <response code="201">The created room. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="409">A room with the same name already exists.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RoomResponse>> Create(RoomRequest request, CancellationToken cancellationToken)
    {
        var room = await rooms.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = room.Id }, room);
    }

    /// <summary>Replaces a room.</summary>
    /// <response code="204">The room is updated.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="404">The room does not exist.</response>
    /// <response code="409">A room with the same name already exists.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, RoomRequest request, CancellationToken cancellationToken) =>
        await rooms.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes a room.</summary>
    /// <response code="204">The room is deleted.</response>
    /// <response code="404">The room does not exist.</response>
    /// <response code="409">The room still has screenings, or tickets are sold for its seats.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await rooms.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
