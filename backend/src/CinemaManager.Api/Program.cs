using CinemaManager.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

var connectionString = builder.Configuration.GetConnectionString("CinemaDb")
    ?? throw new InvalidOperationException("Connection string 'CinemaDb' is not configured.");

builder.Services.AddDbContext<CinemaDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<CinemaDbContext>("database");
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// No HTTPS redirection: TLS is terminated by the reverse proxy (nginx) in front of the API.

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
