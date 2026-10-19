namespace CinemaManager.Api.Errors;

/// <summary>Thrown by a service when a request breaks a business rule. Returned as 409 Conflict.</summary>
public class BusinessRuleException(string message) : Exception(message);
