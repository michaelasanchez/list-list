using Auth.Services.Interfaces;
using ListList.Api.Contracts;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using static Google.Apis.Auth.GoogleJsonWebSignature;

namespace ListList.Api.Services;

public class UserService(IHttpContextAccessor httpContextAccessor, IMemoryCache cache, ITokenService tokenService, IUnitOfWork unitOfWork) : IUserService
{
    private readonly MemoryCacheEntryOptions _cacheOptions = new MemoryCacheEntryOptions()
        .SetSlidingExpiration(TimeSpan.FromMinutes(15))
        .SetAbsoluteExpiration(TimeSpan.FromMinutes(60));

    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IMemoryCache _cache = cache;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    public async Task<Guid> GetUserIdAsync()
    {
        if (!_httpContextAccessor.HttpContext.User.Identity.IsAuthenticated)
        {
            throw new Exception("User not authenticated");
        }

        var userClaims = _httpContextAccessor.HttpContext.User.Identities.Single().Claims;

        var subject = userClaims.FirstOrDefault(z => z.Type == "sub")?.Value;

        if (subject is null)
        {
            throw new Exception("");
        }

        if (_cache.TryGetValue<Guid?>(subject, out var userId))
        {
            return userId!.Value;
        }

        userId = await _unitOfWork.UserRepository.GetUserIdAsync(subject);

        if (userId is null)
        {
            throw new Exception("User is not registered");
        }

        _cache.Set(subject, userId.Value, _cacheOptions);

        return userId!.Value;
    }

    public async Task<ApiToken?> LoginAsync(string authorizationCode)
    {
        var tokenResponse = await _tokenService.ExchangeTokenAsync(authorizationCode);

        Payload payload = await ValidateAsync(tokenResponse.IdToken);

        string subject = payload.Subject;

        var userExists = await _unitOfWork.UserRepository.UserExistsAsync(subject);

        if (!userExists)
        {
            await _unitOfWork.UserRepository.CreateUserAsync(subject);

            await _unitOfWork.SaveChangesAsync();
        }

        return new ApiToken
        {
            IdToken = tokenResponse.IdToken,
            Expiry = tokenResponse.IssuedUtc.AddSeconds(tokenResponse.ExpiresInSeconds!.Value),
            RefreshToken = tokenResponse.RefreshToken
        };
    }

    public async Task<ApiToken?> RefreshAsync(string refreshToken)
    {
        var tokenResponse = await _tokenService.RefreshTokenAsync(refreshToken);

        return new ApiToken
        {
            IdToken = tokenResponse.IdToken,
            Expiry = tokenResponse.IssuedUtc.AddSeconds(tokenResponse.ExpiresInSeconds!.Value),
            RefreshToken = tokenResponse.RefreshToken
        };
    }
}
