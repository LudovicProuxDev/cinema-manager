using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record RoomRequest([Required, MaxLength(50)] string Name);

public record RoomResponse(int Id, string Name)
{
    public static RoomResponse From(Room room) => new(room.Id, room.Name);
}
