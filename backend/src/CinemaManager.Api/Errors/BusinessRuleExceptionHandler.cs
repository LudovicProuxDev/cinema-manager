using Microsoft.AspNetCore.Diagnostics;

namespace CinemaManager.Api.Errors;

/// <summary>Turns a <see cref="BusinessRuleException"/> into a 409 Conflict problem details.</summary>
public class BusinessRuleExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not BusinessRuleException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = { Status = StatusCodes.Status409Conflict, Detail = exception.Message },
        });
    }
}
