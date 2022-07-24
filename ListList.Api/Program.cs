using AutoMapper;
using ListList.Api.Mappers;
using ListList.Api.Mappers.Interfaces;
using ListList.Api.Mappers.Profiles;
using ListList.Api.Middleware;
using ListList.Api.Services;
using ListList.Api.Services.Interfaces;
using ListList.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.RegisterDataServices(builder.Configuration.GetConnectionString("ListListContext"));

// Auto Mapper Configurations
var mapperConfig = new MapperConfiguration(mc =>
{
    mc.AddProfile(new ListItemProfile());
});

IMapper mapper = mapperConfig.CreateMapper();

// DI
builder.Services.AddSingleton(mapper);

builder.Services.AddScoped<IListItemMapper, ListItemMapper>();

builder.Services.AddScoped<IListItemService, ListItemService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddHttpContextAccessor();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(o =>
    {
        o.SecurityTokenValidators.Clear();
        o.SecurityTokenValidators.Add(new GoogleTokenValidator("761782415642-dmpa7o13ppv0h3qa0su755368jd72qfu.apps.googleusercontent.com"));
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.WithOrigins("http://localhost:9000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddControllers();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ListList.Api", Version = "v1" });
    //c.EnableAnnotations();

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
            Reference = new OpenApiReference
                {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,

            },
            new List<string>()
        }
    });

    // Set the comments path for the Swagger JSON and UI.
    //var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    //var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    //c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthorization();

app.UseAuthentication();

app.MapControllers();

app.Run();
