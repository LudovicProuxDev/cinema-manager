using CinemaManager.Api.Dtos;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManager.Api.Controllers;

/// <summary>Users who book tickets. Emails are unique, regardless of case.</summary>
[ApiController]
[Route("[controller]")]
public class UsersController(IUserService users) : ControllerBase
{
    /// <summary>Lists all the users.</summary>
    [HttpGet]
    public Task<IReadOnlyList<UserResponse>> GetAll(CancellationToken cancellationToken) =>
        users.GetAllAsync(cancellationToken);

    /// <summary>Gets an user.</summary>
    /// <response code="200">The user.</response>
    /// <response code="404">The user does not exist.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await users.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : user;
    }

    /// <summary>Creates an user.</summary>
    /// <response code="201">The created user. Its URL is in the Location header.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="409">A user with the same email already exists.</response>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserResponse>> Create(UserRequest request, CancellationToken cancellationToken)
    {
        var user = await users.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /// <summary>Replaces an user.</summary>
    /// <response code="204">The user is updated.</response>
    /// <response code="400">The request is invalid.</response>
    /// <response code="404">The user does not exist.</response>
    /// <response code="409">A user with the same email already exists.</response>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, UserRequest request, CancellationToken cancellationToken) =>
        await users.UpdateAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    /// <summary>Deletes an user.</summary>
    /// <response code="204">The user is deleted.</response>
    /// <response code="404">The user does not exist.</response>
    /// <response code="409">The user still has reservations.</response>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken) =>
        await users.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
