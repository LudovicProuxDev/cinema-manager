using System.Net;
using CinemaManager.Api.Dtos;
using CinemaManager.Api.Tests.Data;

namespace CinemaManager.Api.Tests.Controllers;

[Collection(DatabaseCollection.Name)]
public class RoomsControllerTests(DatabaseFixture database)
    : CrudControllerTests<RoomRequest, RoomResponse>(database)
{
    public static TheoryData<RoomRequest, string> InvalidRequests =>
        new()
        {
            { new RoomRequest(""), nameof(RoomRequest.Name) },
            { new RoomRequest(new string('x', 51)), nameof(RoomRequest.Name) },
        };

    protected override string Route => "/rooms";

    // Room names are unique: every request gets a new one
    protected override Task<RoomRequest> NewRequestAsync() => Task.FromResult(new RoomRequest(TestData.NewRoom().Name));

    protected override Task<RoomRequest> ModifyAsync(RoomRequest request) => NewRequestAsync();

    protected override int IdOf(RoomResponse response) => response.Id;

    protected override void AssertMatches(RoomRequest expected, RoomResponse actual) =>
        Assert.Equal(expected.Name, actual.Name);

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public Task Create_InvalidRequest_ReturnsValidationError(RoomRequest request, string field) =>
        AssertCreateIsInvalidAsync(request, field);

    [Fact]
    public async Task Create_DuplicateName_ReturnsConflict()
    {
        var request = await NewRequestAsync();
        await CreateAsync(request);

        await AssertCreateReturnsAsync(request, HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Delete_WithScreenings_ReturnsConflict()
    {
        var screening = await SeedAsync(TestData.SeedScreeningAsync);

        await AssertDeleteReturnsAsync(screening.RoomId, HttpStatusCode.Conflict);
    }
}
