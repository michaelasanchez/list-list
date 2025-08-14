using ListList.Api.Contracts;

namespace ListList.Api.Services.Interfaces;

public interface IUserService
{
    Task<Guid?> GetUserIdAsync();
    Task<Token?> LoginAsync(string authorizationCode);
    Task<Token?> RefreshAsync(string refreshToken);
}
