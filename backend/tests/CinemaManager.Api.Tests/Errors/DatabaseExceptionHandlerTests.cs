using CinemaManager.Api.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace CinemaManager.Api.Tests.Errors;

public class DatabaseExceptionHandlerTests
{
    private readonly DatabaseExceptionHandler _handler = new(
        new ServiceCollection().AddOptions().AddProblemDetails().BuildServiceProvider().GetRequiredService<IProblemDetailsService>());

    public static TheoryData<Exception> UnhandledExceptions => new()
    {
        new InvalidOperationException("Not a database error"),
        new DbUpdateException("Not from PostgreSQL", new TimeoutException()),
        new DbUpdateException("Another constraint", new PostgresException("check", "ERROR", "ERROR", PostgresErrorCodes.CheckViolation)),
    };

    [Theory]
    [MemberData(nameof(UnhandledExceptions))]
    public async Task OtherExceptions_AreLeftToTheDefaultHandling(Exception exception)
    {
        var handled = await _handler.TryHandleAsync(new DefaultHttpContext(), exception, CancellationToken.None);

        Assert.False(handled);
    }
}
