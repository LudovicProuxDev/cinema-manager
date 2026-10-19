using System.Net;
using System.Text.Json;
using CinemaManager.Api.Tests.Data;
using Microsoft.AspNetCore.Hosting;

namespace CinemaManager.Api.Tests;

/// <summary>The OpenAPI document and its Swagger UI, exposed in Development only.</summary>
[Collection(DatabaseCollection.Name)]
public class OpenApiTests(DatabaseFixture database)
{
    private async Task<JsonElement> GetDocumentAsync()
    {
        var json = await database.CreateClient().GetStringAsync("/openapi/v1.json");
        return JsonDocument.Parse(json).RootElement;
    }

    private static JsonElement Operation(JsonElement document, string path, string method) =>
        document.GetProperty("paths").GetProperty(path).GetProperty(method);

    private static IEnumerable<string> StatusCodesOf(JsonElement operation) =>
        operation.GetProperty("responses").EnumerateObject().Select(response => response.Name);

    [Fact]
    public async Task Document_HasTheApiTitle()
    {
        var document = await GetDocumentAsync();

        Assert.Equal("Cinema Manager API", document.GetProperty("info").GetProperty("title").GetString());
    }

    [Theory]
    [InlineData("/movies", "get", new[] { "200" })]
    [InlineData("/movies", "post", new[] { "201", "400" })]
    [InlineData("/movies/{id}", "get", new[] { "200", "404" })]
    [InlineData("/movies/{id}", "put", new[] { "204", "400", "404" })]
    [InlineData("/movies/{id}", "delete", new[] { "204", "404", "409" })]
    [InlineData("/rooms", "post", new[] { "201", "400", "409" })]
    [InlineData("/rooms/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/seats", "post", new[] { "201", "400", "409" })]
    [InlineData("/seats/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/seats/{id}", "delete", new[] { "204", "404", "409" })]
    [InlineData("/screenings", "post", new[] { "201", "400" })]
    [InlineData("/screenings/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/screenings/{id}", "delete", new[] { "204", "404", "409" })]
    [InlineData("/users", "post", new[] { "201", "400", "409" })]
    [InlineData("/users/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/users/{id}", "delete", new[] { "204", "404", "409" })]
    [InlineData("/reservations", "post", new[] { "201", "400" })]
    [InlineData("/reservations/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/reservations/{id}", "delete", new[] { "204", "404" })]
    [InlineData("/tickets", "post", new[] { "201", "400", "409" })]
    [InlineData("/tickets/{id}", "put", new[] { "204", "400", "404", "409" })]
    [InlineData("/tickets/{id}", "delete", new[] { "204", "404" })]
    public async Task Operations_DocumentTheirStatusCodes(string path, string method, string[] statusCodes)
    {
        var document = await GetDocumentAsync();

        Assert.Equal(statusCodes.Order(), StatusCodesOf(Operation(document, path, method)).Order());
    }

    [Fact]
    public async Task Operations_HaveASummaryFromTheXmlComments()
    {
        var document = await GetDocumentAsync();

        var operations = document.GetProperty("paths").EnumerateObject()
            .SelectMany(path => path.Value.EnumerateObject());

        Assert.All(operations, operation =>
            Assert.False(string.IsNullOrWhiteSpace(operation.Value.TryGetProperty("summary", out var summary) ? summary.GetString() : null),
                $"Missing summary: {operation.Name} {operation.Value}"));
    }

    [Fact]
    public async Task ErrorResponses_AreProblemDetails()
    {
        var document = await GetDocumentAsync();

        var conflict = Operation(document, "/movies/{id}", "delete").GetProperty("responses").GetProperty("409");

        Assert.Contains("ProblemDetails", conflict.GetRawText());
    }

    [Fact]
    public async Task RequestFields_AreDescribed()
    {
        var document = await GetDocumentAsync();

        var startsAt = document.GetProperty("components").GetProperty("schemas")
            .GetProperty("ScreeningRequest").GetProperty("properties").GetProperty("startsAt");

        Assert.Contains("time zone", startsAt.GetProperty("description").GetString());
    }

    [Fact]
    public async Task SwaggerUi_IsServed()
    {
        var response = await database.CreateClient().GetAsync("/swagger");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("text/html", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task SwaggerUi_LoadsTheDocumentWithARelativeUrl()
    {
        // Relative to /swagger/, so it also works behind nginx under /api/swagger/
        var configuration = await database.CreateClient().GetStringAsync("/swagger/index.js");

        Assert.Contains("\"url\":\"../openapi/v1.json\"", configuration);
    }

    [Theory]
    [InlineData("/openapi/v1.json")]
    [InlineData("/swagger")]
    public async Task Documentation_IsNotExposedInProduction(string url)
    {
        await using var api = new CinemaApiFactory(database.ConnectionString)
            .WithWebHostBuilder(builder => builder.UseEnvironment("Production"));

        var response = await api.CreateClient().GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
