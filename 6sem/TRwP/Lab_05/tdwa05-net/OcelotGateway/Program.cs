using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Ocelot.LoadBalancer.Interfaces;
using OcelotGateway;

var builder = WebApplication.CreateBuilder(args);

////// Вариант 1: Round Robin
//builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
//builder.Services.AddOcelot();

////// Вариант 2: Sticky Sessions
//builder.Configuration.AddJsonFile("ocelot.sticky.json", optional: false, reloadOnChange: true);
//builder.Services.AddOcelot();

//// Вариант 3: Custom Balancer
builder.Configuration.AddJsonFile("ocelot.custom.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();
builder.Services.AddSingleton<ILoadBalancerFactory, CustomWeightedLoadBalancerFactory>();


builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();

await app.UseOcelot();

app.Run();