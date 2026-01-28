using ASPA0011_1.Services;
using ASPA0011_1.Logging;
using Microsoft.Extensions.Logging;
using System.ComponentModel; // Добавьте эту директиву для Win32Exception

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Register custom services
builder.Services.AddSingleton<IChannelService, ChannelService>();

// Configure logging
builder.Logging.ClearProviders();

// 1. Console provider - только Warning, Error, Critical
builder.Logging.AddConsole(options =>
{
    // Фильтр для Console провайдера
}).AddFilter<Microsoft.Extensions.Logging.Console.ConsoleLoggerProvider>(level =>
    level >= LogLevel.Warning); // Только Warning и выше

// 2. Debug provider - только Debug и выше (для Visual Studio)
if (builder.Environment.IsDevelopment())
{
    builder.Logging.AddDebug();
    // Debug провайдер будет показывать Debug, Information, Warning, Error, Critical
}

// 3. FileLoggerProvider - все уровни начиная с Trace
builder.Services.AddSingleton<ILoggerProvider, FileLoggerProvider>();

// Настройка фильтров для КАЖДОГО провайдера отдельно
builder.Logging
    // Для Console: только Warning, Error, Critical (уже настроено выше)

    // Для Debug: все уровни начиная с Debug
    .AddFilter<Microsoft.Extensions.Logging.Debug.DebugLoggerProvider>(level =>
        level >= LogLevel.Debug)

    // Для FileLogger: все уровни начиная с Trace
    .AddFilter<FileLoggerProvider>(level =>
        level >= LogLevel.Trace)

    // Фильтры для системных пространств имен
    .AddFilter("Microsoft", LogLevel.Warning)    // Microsoft - только Warning и выше
    .AddFilter("System", LogLevel.Warning)       // System - только Warning и выше
    .AddFilter("ASPA0011_1", LogLevel.Trace);    // Ваше приложение - все уровни

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();

// Add a simple root endpoint for testing
app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(@"
        <html>
        <head><title>ASPA0011_1 API</title></head>
        <body>
            <h1>ASPA0011_1 API is running!</h1>
            <p>Available endpoints:</p>
            <ul>
                <li>GET <a href='/api/channels'>/api/channels</a> - Get all channels</li>
                <li>POST /api/channels - Create new channel</li>
                <li>POST /api/queue - Queue operations</li>
            </ul>
            <p>Use Postman to test POST endpoints.</p>
        </body>
        </html>
    ");
});

// В Program.cs добавьте endpoint
app.MapGet("/test-critical", (ILogger<Program> logger) =>
{
    logger.LogCritical("ТЕСТ КРИТИЧЕСКОЙ ОШИБКИ: Приложение в аварийном состоянии!");
    return Results.Ok(new
    {
        message = "Critical log test completed",
        level = "Critical",
        timestamp = DateTime.Now
    });
});

// Исправленный endpoint с исключением
app.MapGet("/test-critical-exception", (ILogger<Program> logger) =>
{
    try
    {
        // Создаем Win32Exception с конкретным кодом ошибки
        throw new Win32Exception(5, "Access is denied"); // Код ошибки 5 - доступ запрещен
    }
    catch (Win32Exception ex) // Ловим конкретно Win32Exception
    {
        logger.LogCritical(ex, "КРИТИЧЕСКИЙ СБОЙ СИСТЕМЫ: {ErrorCode} - {ErrorMessage}",
            ex.NativeErrorCode, ex.Message);
        return Results.Problem("Critical system failure simulated");
    }
});

// Дополнительные тестовые endpoints для разных типов Critical ошибок
app.MapGet("/test-critical-memory", (ILogger<Program> logger) =>
{
    try
    {
        throw new OutOfMemoryException("Simulated out of memory error");
    }
    catch (OutOfMemoryException ex)
    {
        logger.LogCritical(ex, "КРИТИЧЕСКАЯ ОШИБКА ПАМЯТИ: {ErrorMessage}", ex.Message);
        return Results.Problem("Out of memory simulated");
    }
});


app.MapGet("/test-critical-generic", (ILogger<Program> logger) =>
{
    try
    {
        throw new Exception("Generic critical application failure");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "КРИТИЧЕСКИЙ СБОЙ ПРИЛОЖЕНИЯ");
        return Results.Problem("Generic critical failure simulated");
    }
});

// Add test endpoint
app.MapGet("/test", () =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Test endpoint called at {Time}", DateTime.Now);
    return Results.Ok(new { message = "Test successful!", timestamp = DateTime.Now });
});

// Log application start
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
startupLogger.LogInformation("Application ASPA0011_1 started successfully on: {Time}", DateTime.Now);

app.Run();




//using ASPA0011_1.Services;
//using ASPA0011_1.Logging;
//using Microsoft.Extensions.Logging;

//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container
//builder.Services.AddControllers();
//builder.Services.AddEndpointsApiExplorer();

//// Register custom services
//builder.Services.AddSingleton<IChannelService, ChannelService>();

//// Configure logging
////builder.Logging.ClearProviders();
////builder.Logging.AddConsole();

////if (builder.Environment.IsDevelopment())
////{
////    builder.Logging.AddDebug();
////    builder.Logging.SetMinimumLevel(LogLevel.Trace);
////}
////else
////{
////    builder.Logging.SetMinimumLevel(LogLevel.Information);
////}

////// Configure specific log levels
////builder.Logging.AddFilter("Microsoft", LogLevel.Warning);
////builder.Logging.AddFilter("System", LogLevel.Warning);

////// Add custom file logging provider
////builder.Services.AddSingleton<ILoggerProvider, FileLoggerProvider>();
//// Configure logging
//builder.Logging.ClearProviders();
//builder.Logging.AddConsole();

//if (builder.Environment.IsDevelopment())
//{
//    builder.Logging.AddDebug();
//}

//builder.Logging.AddFilter("ASPA0011_1.Controllers", LogLevel.Trace);    // Все контроллеры
//builder.Logging.AddFilter("ASPA0011_1.Services", LogLevel.Trace);       // Все сервисы
//builder.Logging.AddFilter("ASPA0011_1", LogLevel.Trace);                // Все остальное в вашем приложении

//// Configure specific log levels for system namespaces
//builder.Logging.AddFilter("Microsoft", LogLevel.Warning);
//builder.Logging.AddFilter("System", LogLevel.Warning);

//// Add custom file logging provider
//builder.Services.AddSingleton<ILoggerProvider, FileLoggerProvider>();

//var app = builder.Build();

//// Configure the HTTP request pipeline
//if (app.Environment.IsDevelopment())
//{
//    app.UseDeveloperExceptionPage();
//}
//else
//{
//    app.UseExceptionHandler("/error");
//    app.UseHsts();
//}

//app.UseHttpsRedirection();
//app.UseStaticFiles();
//app.UseRouting();
//app.UseAuthorization();

//app.MapControllers();

//// Add a simple root endpoint for testing
//app.MapGet("/", async context =>
//{
//    context.Response.ContentType = "text/html";
//    await context.Response.WriteAsync(@"
//        <html>
//        <head><title>ASPA0011_1 API</title></head>
//        <body>
//            <h1>ASPA0011_1 API is running!</h1>
//            <p>Available endpoints:</p>
//            <ul>
//                <li>GET <a href='/api/channels'>/api/channels</a> - Get all channels</li>
//                <li>POST /api/channels - Create new channel</li>
//                <li>POST /api/queue - Queue operations</li>
//            </ul>
//            <p>Use Postman to test POST endpoints.</p>
//        </body>
//        </html>
//    ");
//});

//// Add test endpoint
//app.MapGet("/test", () =>
//{
//    var logger = app.Services.GetRequiredService<ILogger<Program>>();
//    logger.LogInformation("Test endpoint called at {Time}", DateTime.Now);
//    return Results.Ok(new { message = "Test successful!", timestamp = DateTime.Now });
//});

//// Log application start
//var logger = app.Services.GetRequiredService<ILogger<Program>>();
//logger.LogInformation("Application ASPA0011_1 started successfully on: {Time}", DateTime.Now);

//app.Run();