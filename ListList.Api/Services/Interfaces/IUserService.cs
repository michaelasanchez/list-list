using ListList.Api.Contracts;

namespace ListList.Api.Services.Interfaces;

public interface IUserService
{
    Task<Guid?> GetUserId();
    Task<Token?> LoginAsync(string authorizationCode);
    Task<Token?> RefreshAsync(string refreshToken);
}
