using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task CreateUserAsync(string subject);
    Task<Guid?> GetUserIdAsync(string subject);
    Task<bool> UserExistsAsync(string subject);
}
