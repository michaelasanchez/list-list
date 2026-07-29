using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class UserRepository(ListListContext _context) : IUserRepository
{
    public Task<UserEntity?> GetUserByGoogleSubAsync(string googleSub)
    {
        return _context.Users.FirstOrDefaultAsync(u => u.Subject == googleSub);
    }

    public Task UpdateRefreshTokenAsync(Guid id, string refreshToken)
    {
        return _context.Users
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(u => u.SetProperty(x => x.RefreshToken, refreshToken));
    }

    public async Task<UserEntity> UpsertUserAsync(UserResource dto)
    {
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Subject == dto.Subject);

        if (existing == null)
        {
            existing = new UserEntity
            {
                Id = Guid.NewGuid(),
                Subject = dto.Subject,
                Email = dto.Email,
                Name = dto.Name,
                PictureUrl = dto.PictureUrl,
                RefreshToken = dto.RefreshToken
            };

            _context.Users.Add(existing);
        }
        else
        {
            existing.Name = dto.Name;
            existing.PictureUrl = dto.PictureUrl;

            if (!string.IsNullOrEmpty(dto.RefreshToken))
            {
                existing.RefreshToken = dto.RefreshToken;
            }
        }

        await _context.SaveChangesAsync();

        return existing;
    }
}