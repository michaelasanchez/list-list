using Auth.Services.Interfaces;
using AutoMapper;
using ListList.Api.Services.Interfaces;
using ListList.Data.Models.Interfaces;
using ListList.Data.Models.Resources;

namespace ListList.Api.Services;

public class UserService(
    IMapper _mapper,
    ITokenService _tokenService,
    IUnitOfWork _unitOfWork) : IUserService
{
    public async Task<UserResource?> GetUserBySubject(string subject)
    {
        var entity = await _unitOfWork.UserRepository.GetUserByGoogleSubAsync(subject);

        return _mapper.Map<UserResource>(entity);
    }

    public async Task<UserResource> Login(string code)
    {
        var tokenResponse = await _tokenService.ExchangeTokenAsync(code);

        var payload = await _tokenService.ValidateTokenAsync(tokenResponse);

        var entity = await _unitOfWork.UserRepository.UpsertUserAsync(new UserResource
        {
            Subject = payload.Subject,
            Email = payload.Email,
            Name = payload.Name,
            PictureUrl = payload.Picture,
            RefreshToken = tokenResponse.RefreshToken
        });

        return _mapper.Map<UserResource>(entity);
    }

    public async Task UpdateRefreshToken(Guid userId, string refreshToken)
    {
        await _unitOfWork.UserRepository.UpdateRefreshTokenAsync(userId, refreshToken);
    }
}
