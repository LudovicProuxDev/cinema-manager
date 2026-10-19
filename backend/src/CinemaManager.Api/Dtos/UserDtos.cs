using System.ComponentModel.DataAnnotations;
using CinemaManager.Api.Entities;

namespace CinemaManager.Api.Dtos;

public record UserRequest(
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(100)] string LastName,
    [Required, EmailAddress, MaxLength(255)] string Email);

public record UserResponse(int Id, string FirstName, string LastName, string Email)
{
    public static UserResponse From(User user) => new(user.Id, user.FirstName, user.LastName, user.Email);
}
