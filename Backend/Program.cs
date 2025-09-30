using Microsoft.EntityFrameworkCore;
using System;
using System.Data.Common;
using System.Collections.Generic;

using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using API;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Backend.Interfaces.IRepositories;
using Backend.Repositories;

using Backend.Interfaces;
using Backend.Services;
using Backend.Models;
using Backend.Hubs;


var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env. Support both root-run and Backend-run.
// 1) Try current working directory
Env.Load();
// 2) Try Backend/.env if not found
if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OPENAI_API_KEY")))
{
    var backendEnvPath = Path.Combine(Directory.GetCurrentDirectory(), "Backend", ".env");
    if (File.Exists(backendEnvPath))
    {
        Env.Load(backendEnvPath);
    }
}

builder.Services.AddOpenApi();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddControllers();
builder.Services.AddSignalR();


builder.Services.AddIdentity<User, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddDbContext<AppDbContext>(options =>
{

    var envHost = Environment.GetEnvironmentVariable("DB_HOST");
    string cs;
    if (!string.IsNullOrEmpty(envHost))
    {
        var host = envHost;
        var port = Environment.GetEnvironmentVariable("DB_PORT") ?? "3306";
        var user = Environment.GetEnvironmentVariable("DB_USER") ?? "";
        var pass = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";
        var db = Environment.GetEnvironmentVariable("DB_NAME") ?? "";
        cs = $"Server={host};Port={port};Database={db};User={user};Password={pass};TreatTinyAsBoolean=true";
    }
    else
    {
        cs = builder.Configuration.GetConnectionString("DefaultConnection");
    }

    options.UseMySql(cs, ServerVersion.AutoDetect(cs));
});
// Chatbot service
builder.Services.AddHttpClient("openai", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/");
    var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (!string.IsNullOrWhiteSpace(apiKey))
    {
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
    }
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
});
builder.Services.AddSingleton<KnowledgeService>();
builder.Services.AddSingleton<ChatbotService>();
builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowReactApp", policy =>
        {
            policy.SetIsOriginAllowed(_ => true)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials(); 
        
        });
    });

builder.Services.AddScoped<JwtToken>();

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("admin"));
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = builder.Configuration.GetValue<string>("Jwt:Key");
    var issuer = builder.Configuration.GetValue<string>("Jwt:Issuer");
    var audience = builder.Configuration.GetValue<string>("Jwt:Audience");
    var keyBytes = Encoding.ASCII.GetBytes(key);

    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
}); 

builder.Services.AddAuthorization();
var app = builder.Build();
// Seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    DbSeeder.Seed(db, userManager, roleManager).Wait();
}
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReactApp");
app.UseRouting();
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapHub<BookingHub>("/bookingHub");

app.Run();