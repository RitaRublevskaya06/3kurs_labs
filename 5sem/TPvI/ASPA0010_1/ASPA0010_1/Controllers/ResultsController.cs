using BSTU.Results.Collection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using ResultsAuthenticate.Services;
using ResultsAuthenticate.Models;

namespace ASPA0010_1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private readonly ResultsCollectionService _resultsService;
        private readonly IAuthenticateService _authService;

        public ResultsController(ResultsCollectionService resultsService, IAuthenticateService authService)
        {
            _resultsService = resultsService;
            _authService = authService;
        }
    
        private string GenerateJwtToken(User user)
        {
            return $"JWT-TOKEN-{user.Login}-{user.Role}-{DateTime.Now:yyyyMMddHHmmss}";
        }

        // ========== ЭНДПОИНТЫ АУТЕНТИФИКАЦИИ ==========

        [HttpPost("SignIn")]
        [AllowAnonymous]
        public async Task<IActionResult> SignIn([FromBody] LoginModel model)
        {
            if (string.IsNullOrEmpty(model.Login) || string.IsNullOrEmpty(model.Password))
                return BadRequest("Login and password are required.");

            var user = await _authService.Login(model.Login, model.Password);

            if (user == null)
                return NotFound("Invalid login or password.");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Login),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            return Ok(new
            {
                Message = $"User {user.Login} signed in successfully.",
                Role = user.Role
            });
        }

        [HttpGet("SignOut")]
        [Authorize]
        public async Task<IActionResult> SignOutUser()
        {
            var userLogin = User.Identity.Name;
            var users = await _authService.GetAllUsers();
            var currentUser = users.FirstOrDefault(u => u.Login == userLogin);

            string jwtToken = "";
            if (currentUser != null)
            {
                // Используем локальный метод вместо _authService.GenerateJwtToken
                jwtToken = GenerateJwtToken(currentUser);
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            return Ok(new
            {
                Message = "User signed out successfully.",
                JwtToken = jwtToken
            });
        }

        [HttpGet("AccessDenied")]
        [AllowAnonymous]
        public IActionResult AccessDenied()
        {
            return Unauthorized("Access denied. Insufficient permissions.");
        }

        // ========== CRUD-ЭНДПОИНТЫ ==========

        [HttpGet]
        [Authorize(Policy = "ReaderOrWriter")]
        public ActionResult<Dictionary<int, string>> Get()
        {
            var allResults = _resultsService.GetAll();
            if (allResults.Count == 0)
            {
                return NoContent();
            }
            return Ok(allResults);
        }

        [HttpGet("{id:int}")]
        [Authorize(Policy = "ReaderOrWriter")]
        public ActionResult<string> Get(int id)
        {
            var result = _resultsService.Get(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "Writer")]
        public IActionResult Post([FromBody] string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return BadRequest("Value cannot be null or empty.");
            }

            try
            {
                var newId = _resultsService.Add(value);
                return CreatedAtAction(nameof(Get), new { id = newId }, new { key = newId, value = value });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = "Writer")]
        public IActionResult Put(int id, [FromBody] string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return BadRequest("Value cannot be null or empty.");
            }

            var isUpdated = _resultsService.Update(id, value);
            if (!isUpdated)
            {
                return NotFound();
            }
            return Ok(new { key = id, value = value });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Policy = "Writer")]
        public IActionResult Delete(int id)
        {
            var isDeleted = _resultsService.Delete(id);
            if (!isDeleted)
            {
                return NotFound();
            }
            return Ok(new { key = id });
        }

        [HttpPost("Register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (string.IsNullOrEmpty(model.Login) || string.IsNullOrEmpty(model.Password))
                return BadRequest("Login and password are required.");

            if (model.Role != Role.Reader && model.Role != Role.Writer)
                return BadRequest("Role must be either 'READER' or 'WRITER'.");

            var result = await _authService.AddUser(model.Login, model.Password, model.Role);

            if (!result)
                return BadRequest("User with this login already exists.");

            return Ok(new { Message = $"User {model.Login} registered successfully with role {model.Role}." });
        }

        [HttpGet("Users")]
        [Authorize(Policy = "Writer")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _authService.GetAllUsers();
            return Ok(users);
        }
    }

    public class LoginModel
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterModel
    {
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}