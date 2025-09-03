using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ListList.Data;

public static class ServiceCollectionExtensions
{
    public static void RegisterDataServices(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<ListListContext>(option => option.UseSqlServer(connectionString));

        services.AddScoped<IListListContext, ListListContext>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IHeaderValidator, HeaderValidator>();
        services.AddScoped<IItemValidator, ItemValidator>();
        services.AddScoped<IShareValidator, ShareValidator>();
        services.AddScoped<IUserValidator, UserValidator>();
    }
}
