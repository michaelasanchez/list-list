using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task AddUserAsync(UserEntity user);
    Task CreateUserAsync(string subject);
    Task<Guid?> GetUserIdAsync(string subject);
    Task<UserEntity> GetUserByUsernameAsync(string username);
    Task<bool> UserExistsAsync(string subject);
}
