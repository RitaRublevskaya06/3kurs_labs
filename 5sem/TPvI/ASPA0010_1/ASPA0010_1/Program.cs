using BSTU.Results.Collection;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ResultsAuthenticate.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddTransient<ResultsCollectionService>();
builder.Services.AddTransient<IAuthenticateService, AuthenticateService>();

// ÄÎÁÀÂËßÅÌ ÑÅÐÂÈÑÛ ÀÓÒÅÍÒÈÔÈÊÀÖÈÈ È ÀÂÒÎÐÈÇÀÖÈÈ
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.LoginPath = "/api/Results/SignIn";
    options.LogoutPath = "/api/Results/SignOut";
    options.AccessDeniedPath = "/api/Results/AccessDenied";
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ASPA0010_1",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ASPA0010_1",
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "super-secret-key-min-16-chars-here"))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Reader", policy => policy.RequireRole("READER"));
    options.AddPolicy("Writer", policy => policy.RequireRole("WRITER"));
    options.AddPolicy("ReaderOrWriter", policy => policy.RequireRole("READER", "WRITER"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.Use(async (context, next) =>
    {
        if (context.Request.Path == "/")
        {
            context.Response.Redirect("/swagger");
            return;
        }
        await next();
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();