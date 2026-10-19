using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class UsersControllerTests(DatabaseFixture database)
    : CrudControllerTests<UserRequest, UserResponse>(database)
{
    private static readonly UserRequest Valid = new("Ada", "Lovelace", "ada@test.local");

    public static TheoryData<UserRequest, string> InvalidRequests =>
        new()
        {
            { Valid with { FirstName = "" }, nameof(UserRequest.FirstName) },
            { Valid with { LastName = new string('x', 101) }, nameof(UserRequest.LastName) },
            { Valid with { Email = "not-an-email" }, nameof(UserRequest.Email) },
            { Valid with { Email = new string('x', 250) + "@test.local" }, nameof(UserRequest.Email) },
        };

    protected override string Route => "/users";

    // Emails are unique: every request gets a new one
    protected override Task<UserRequest> NewRequestAsync() =>
        Task.FromResult(Valid with { Email = TestData.NewUser().Email });

    protected override Task<UserRequest> ModifyAsync(UserRequest request) =>
        Task.FromResult(request with { FirstName = "Grace", LastName = "Hopper" });

    protected override int IdOf(UserResponse response) => response.Id;

    protected override void AssertMatches(UserRequest expected, UserResponse actual) =>
        Assert.Equal(expected, new UserRequest(actual.FirstName, actual.LastName, actual.Email));

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(UserRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public async Task Create_DuplicateEmail_ReturnsConflict()
    {
        var request = await NewRequestAsync();
        await CreateAsync(request);

        await AssertCreateReturnsAsync(request with { FirstName = "Someone else" }, HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Create_SameEmailWithAnotherCase_ReturnsConflict()
    {
        var request = await NewRequestAsync();
        await CreateAsync(request);

        await AssertCreateReturnsAsync(request with { Email = request.Email.ToUpperInvariant() }, HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_WithReservations_ReturnsConflict()
    {
        var reservation = await SeedAsync(TestData.SeedReservationAsync);

        await AssertDeleteReturnsAsync(reservation.UserId, HttpStatusCode.Conflict);
    }
}
