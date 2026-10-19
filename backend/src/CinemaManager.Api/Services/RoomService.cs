using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class RoomService(CinemaDbContext db) : IRoomService
{
    public async Task<IReadOnlyList<RoomResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Rooms.AsNoTracking()
            .OrderBy(r => r.Id)
            .Select(r => RoomResponse.From(r))
            .ToListAsync(cancellationToken);

    public async Task<RoomResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var room = await db.Rooms.FindAsync([id], cancellationToken);
        return room is null ? null : RoomResponse.From(room);
    }

    public async Task<RoomResponse> CreateAsync(RoomRequest request, CancellationToken cancellationToken)
    {
        var room = new Room();
        Apply(request, room);
        db.Rooms.Add(room);
        await db.SaveChangesAsync(cancellationToken);
        return RoomResponse.From(room);
    }

    public async Task<bool> UpdateAsync(int id, RoomRequest request, CancellationToken cancellationToken)
    {
        var room = await db.Rooms.FindAsync([id], cancellationToken);
        if (room is null)
        {
            return false;
        }

        Apply(request, room);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var room = await db.Rooms.FindAsync([id], cancellationToken);
        if (room is null)
        {
            return false;
        }

        db.Rooms.Remove(room);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(RoomRequest request, Room room)
    {
        room.Name = request.Name;
    }
}
