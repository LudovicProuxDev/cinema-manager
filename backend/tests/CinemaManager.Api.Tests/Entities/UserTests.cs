using CinemaManager.Api.Entities;
using CinemaManager.Api.Tests.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Entities;

[Collection(DatabaseCollection.Name)]
public class UserTests(DatabaseFixture database)
{
    [Fact]
    public void IsMappedToUserTable() => Assert.Equal("User", TestData.TableOf<User>(database));

    [Theory]
    [InlineData(nameof(User.FirstName), 100)]
    [InlineData(nameof(User.LastName), 100)]
    [InlineData(nameof(User.Email), 255)]
    public void TextFields_HaveAMaxLength(string property, int maxLength) =>
        Assert.Equal(maxLength, TestData.MaxLengthOf<User>(database, property));

    [Fact]
    public async Task Email_IsUnique()
    {
        await using var context = database.CreateContext();
        var email = $"{Guid.NewGuid():N}@test.local";
        context.Users.Add(TestData.NewUser(email));
        context.Users.Add(TestData.NewUser(email));

        await TestData.AssertSaveFailsWithAsync(context, PostgresErrorCodes.UniqueViolation);
    }

    [Fact]
    public async Task IsPersistedWithItsReservations()
    {
        await using var seedContext = database.CreateContext();
        var userId = (await TestData.SeedReservationAsync(seedContext)).UserId;

        await using var context = database.CreateContext();
        var user = await context.Users.Include(u => u.Reservations).SingleAsync(u => u.Id == userId);

        Assert.Equal("Ada", user.FirstName);
        Assert.Equal("Lovelace", user.LastName);
        Assert.Single(user.Reservations);
    }

    [Fact]
    public async Task WithReservations_CannotBeDeleted()
    {
        await using var seedContext = database.CreateContext();
        var userId = (await TestData.SeedReservationAsync(seedContext)).UserId;

        await TestData.AssertDeleteIsRestrictedAsync<User>(database, userId);
    }
}
