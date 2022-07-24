using ListList.Data.Models.Entities;

namespace ListList.Data.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task AddUserAsync(UserEntity user);

        Task<UserEntity> GetUserByUsernameAsync(string username);
    }
}
