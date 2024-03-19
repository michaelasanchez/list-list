using ListList.Api.Contracts;

namespace ListList.Api.Services.Interfaces;

public interface IUserService
{
    Task<Guid> GetUserIdAsync();
    Task<ApiToken?> LoginAsync(string authorizationCode);
    Task<ApiToken?> RefreshAsync(string refreshToken);
}
