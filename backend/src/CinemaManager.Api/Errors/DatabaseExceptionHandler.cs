using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CinemaManager.Api.Errors;

/// <summary>
/// Turns the constraint violations raised by PostgreSQL into problem details (RFC 9457)
/// instead of 500 errors. Any other exception is left to the default handling.
/// </summary>
public class DatabaseExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not DbUpdateException { InnerException: PostgresException postgres } update)
        {
            return false;
        }

        var deleting = update.Entries.Any(entry => entry.State == EntityState.Deleted);
        (int Status, string Detail)? problem = postgres.SqlState switch
        {
            PostgresErrorCodes.UniqueViolation =>
                (StatusCodes.Status409Conflict, "A resource with the same unique value already exists."),
            PostgresErrorCodes.ForeignKeyViolation when deleting =>
                (StatusCodes.Status409Conflict, "The resource is still referenced by other resources."),
            PostgresErrorCodes.ForeignKeyViolation =>
                (StatusCodes.Status400BadRequest, "The request references a resource that does not exist."),
            _ => null,
        };
        if (problem is null)
        {
            return false;
        }

        httpContext.Response.StatusCode = problem.Value.Status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = { Status = problem.Value.Status, Detail = problem.Value.Detail },
        });
    }
}
