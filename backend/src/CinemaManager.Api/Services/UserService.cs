using CinemaManager.Api.Data;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManager.Api.Services;

public class UserService(CinemaDbContext db) : IUserService
{
    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken) =>
        await db.Users.AsNoTracking()
            .OrderBy(u => u.Id)
            .Select(u => UserResponse.From(u))
            .ToListAsync(cancellationToken);

    public async Task<UserResponse?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([id], cancellationToken);
        return user is null ? null : UserResponse.From(user);
    }

    public async Task<UserResponse> CreateAsync(UserRequest request, CancellationToken cancellationToken)
    {
        var user = new User();
        Apply(request, user);
        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);
        return UserResponse.From(user);
    }

    public async Task<bool> UpdateAsync(int id, UserRequest request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([id], cancellationToken);
        if (user is null)
        {
            return false;
        }

        Apply(request, user);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var user = await db.Users.FindAsync([id], cancellationToken);
        if (user is null)
        {
            return false;
        }

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void Apply(UserRequest request, User user)
    {
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        // Emails are case-insensitive: store them in lower case so the unique index catches "Ada@..." vs "ada@..."
        user.Email = request.Email.ToLowerInvariant();
    }
}
