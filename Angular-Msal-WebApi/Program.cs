using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);
var policyName = "AllowAll";
            
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: policyName,
        policy => { 
            policy
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowAnyOrigin();
        });
});

// Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("ApiAppRegistration");
        options.TokenValidationParameters.NameClaimType = "name";
    }, options =>
    {
        builder.Configuration.Bind("ApiAppRegistration", options);
    });
// Authorization
builder.Services.AddAuthorization(config =>
{
    config.AddPolicy("AuthPolicy", policy => policy.RequireRole("Crm.Access"));
});

builder.Services.AddOpenApi();
builder.Services.AddControllers();

var app = builder.Build();

app.UseCors(policyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
