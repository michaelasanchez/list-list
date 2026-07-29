using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<UserEntity?> GetUserByGoogleSubAsync(string googleSub);
    Task UpdateRefreshTokenAsync(Guid id, string refreshToken);
    Task<UserEntity> UpsertUserAsync(UserResource user);
}
