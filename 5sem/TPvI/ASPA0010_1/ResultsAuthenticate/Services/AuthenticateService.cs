using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using ResultsAuthenticate.Models;
using ResultsAuthenticate.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

public class AuthenticateService : IAuthenticateService
{
    private List<User> _users;
    private readonly string _usersFilePath;
    private readonly IConfiguration _configuration;

    public AuthenticateService(IConfiguration configuration)
    {
        _configuration = configuration;
        _usersFilePath = Path.Combine(Directory.GetCurrentDirectory(), "users.json");
        _users = LoadUsers();

        // Если пользователей нет, создаем стандартных
        if (!_users.Any())
        {
            CreateDefaultUsers();
        }
    }

    private List<User> LoadUsers()
    {
        try
        {
            if (File.Exists(_usersFilePath))
            {
                var json = File.ReadAllText(_usersFilePath);
                return JsonSerializer.Deserialize<List<User>>(json) ?? new List<User>();
            }
        }
        catch (Exception)
        {
            // Если файл поврежден, создаем заново
        }
        return new List<User>();
    }

    private void SaveUsers()
    {
        try
        {
            var json = JsonSerializer.Serialize(_users, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_usersFilePath, json);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to save users: {ex.Message}");
        }
    }

    private void CreateDefaultUsers()
    {
        _users = new List<User>
        {
            new User { Id = 1, Login = "reader", Password = "reader123", Role = Role.Reader },
            new User { Id = 2, Login = "writer", Password = "writer123", Role = Role.Writer }
        };
        SaveUsers();
    }

    public Task<User?> Login(string login, string password)
    {
        var user = _users.FirstOrDefault(u => u.Login == login && u.Password == password);
        return Task.FromResult(user);
    }

    public Task Logout()
    {
        return Task.CompletedTask;
    }

    public bool UserHasAccess(HttpContext context, string requiredRole)
    {
        if (!context.User.Identity.IsAuthenticated)
            return false;

        return context.User.IsInRole(requiredRole);
    }

    public Task<bool> AddUser(string login, string password, string role)
    {
        if (_users.Any(u => u.Login == login))
            return Task.FromResult(false);

        var newId = _users.Any() ? _users.Max(u => u.Id) + 1 : 1;
        _users.Add(new User { Id = newId, Login = login, Password = password, Role = role });
        SaveUsers();

        return Task.FromResult(true);
    }

    public Task<List<User>> GetAllUsers()
    {
        return Task.FromResult(_users);
    }

    // Новый метод для генерации JWT токена
    public string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Role, user.Role)
        };

        // Используем ключ из конфигурации или fallback
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? "super-secret-key-min-16-chars-here"));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ASPA0010_1",
            audience: _configuration["Jwt:Audience"] ?? "ASPA0010_1",
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}