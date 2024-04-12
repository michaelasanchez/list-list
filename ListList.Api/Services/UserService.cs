using Auth.Services.Interfaces;
using ListList.Api.Contracts;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using static Google.Apis.Auth.GoogleJsonWebSignature;

namespace ListList.Api.Services;

public class UserService(IHttpContextAccessor _httpContextAccessor, IMemoryCache _cache, ITokenService _tokenService, IUnitOfWork _unitOfWork) : IUserService
{
    private readonly MemoryCacheEntryOptions _cacheOptions = new MemoryCacheEntryOptions()
        .SetSlidingExpiration(TimeSpan.FromDays(7));

    public async Task<Guid> GetUserIdAsync()
    {
        if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated is false)
        {
            throw new Exception("User not authenticated.");
        }

        var userClaims = _httpContextAccessor.HttpContext?.User.Identities.Single().Claims;

        var subject = userClaims?.FirstOrDefault(z => z.Type == ClaimTypes.NameIdentifier)?.Value;

        if (subject is null)
        {
            throw new Exception("User subject is missing.");
        }

        if (_cache.TryGetValue<Guid?>(subject, out var userId))
        {
            return userId!.Value;
        }

        userId = await _unitOfWork.UserRepository.GetUserIdAsync(subject);

        if (userId is null)
        {
            throw new Exception("User is not registered.");
        }

        _cache.Set(subject, userId.Value, _cacheOptions);

        return userId.Value;
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
