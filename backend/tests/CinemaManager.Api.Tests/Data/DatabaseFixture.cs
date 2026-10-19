using CinemaManager.Api.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Tests.Data;

/// <summary>
/// Creates a throwaway PostgreSQL database with all migrations applied, and drops it at the end of the run.
/// The server comes from the same "ConnectionStrings__CinemaDb" variable as the API.
/// Also hosts the API in memory against that database, for the controller tests.
/// </summary>
public sealed class DatabaseFixture : IAsyncLifetime
{
    private CinemaApiFactory? _api;

    public DatabaseFixture()
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__CinemaDb")
            ?? throw new InvalidOperationException("Environment variable 'ConnectionStrings__CinemaDb' is not set.");

        ConnectionString = new NpgsqlConnectionStringBuilder(connectionString)
        {
            Database = $"cinema_test_{Guid.NewGuid():N}",
        }.ConnectionString;
    }

    public string ConnectionString { get; }

    public CinemaDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<CinemaDbContext>().UseNpgsql(ConnectionString).Options);

    public HttpClient CreateClient() => (_api ??= new CinemaApiFactory(ConnectionString)).CreateClient();

    public async Task InitializeAsync()
    {
        await using var context = CreateContext();
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (_api is not null)
        {
            await _api.DisposeAsync();
        }

        await using var context = CreateContext();
        await context.Database.EnsureDeletedAsync();
    }
}

[CollectionDefinition(Name)]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
    public const string Name = "Database";
}
