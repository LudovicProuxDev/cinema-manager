using CinemaManager.Api.Data;
using CinemaManager.Api.Errors;
using CinemaManager.Api.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var connectionString = builder.Configuration.GetConnectionString("CinemaDb")
    ?? throw new InvalidOperationException("Connection string 'CinemaDb' is not configured.");

builder.Services.AddDbContext<CinemaDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ISeatService, SeatService>();
builder.Services.AddScoped<IScreeningService, ScreeningService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ITicketService, TicketService>();

builder.Services.AddControllers()
    // A field missing from the JSON is an error, instead of silently taking its default value (0, 0001-01-01...)
    .AddJsonOptions(options => options.JsonSerializerOptions.RespectRequiredConstructorParameters = true);
builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<BusinessRuleExceptionHandler>();
builder.Services.AddExceptionHandler<DatabaseExceptionHandler>();

// Behind nginx: build URLs (e.g. the Location header) from the scheme, host and /api prefix the client used
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
        | ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedPrefix;

    // nginx runs in another container, whose address is not known in advance
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CinemaDbContext>("database");
// OpenAPI document, built from the controllers, their attributes and XML comments: https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options => options.AddDocumentTransformer((document, _, _) =>
{
    document.Info.Title = "Cinema Manager API";
    document.Info.Description = "Manage the movies, rooms, seats and screenings of a cinema, and book tickets.";
    return Task.CompletedTask;
}));

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // the document: /openapi/v1.json

    // Swagger UI, to read and try the API: /swagger. The document URL is relative to /swagger/,
    // so it also works behind nginx, under /api/swagger/.
    app.UseSwaggerUI(options => options.SwaggerEndpoint("../openapi/v1.json", "Cinema Manager API v1"));
}

// No HTTPS redirection: TLS is terminated by the reverse proxy (nginx) in front of the API.

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
