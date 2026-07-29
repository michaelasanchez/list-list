using ListList.Data.Models.Resources;

namespace ListList.Api.Services.Interfaces;

public interface IUserService
{
    Task<UserResource> Login(string code);
    Task<UserResource?> GetUserBySubject(string subject);
    Task UpdateRefreshToken(Guid userId, string refreshToken);
}
