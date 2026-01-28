using Microsoft.AspNetCore.Http;
using ResultsAuthenticate.Models;

namespace ResultsAuthenticate.Services
{
    public interface IAuthenticateService
    {
        Task<User?> Login(string login, string password);
        Task Logout();
        bool UserHasAccess(HttpContext context, string requiredRole);
        Task<bool> AddUser(string login, string password, string role);
        Task<List<User>> GetAllUsers();
        string GenerateJwtToken(User user); 
    }
}