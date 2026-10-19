using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

/// <summary>A room to create or replace.</summary>
/// <param name="Name">Unique name, up to 50 characters.</param>
public record RoomRequest([Required, MaxLength(50)] string Name);

public record RoomResponse(int Id, string Name)
{
    public static RoomResponse From(Room room) => new(room.Id, room.Name);
}
