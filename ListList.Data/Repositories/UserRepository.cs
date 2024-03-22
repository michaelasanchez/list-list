using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class UserRepository(IListListContext _context) : IUserRepository
{
    public async Task CreateUserAsync(string subject)
    {
        var user = new UserEntity { Subject = subject };

        await _context.Users.AddAsync(user);
    }

    public async Task<Guid?> GetUserIdAsync(string subject)
    {
        return await _context.Users
            .Where(z => z.Subject == subject)
            .Select(z => z.Id)
            .SingleOrDefaultAsync();
    }

    public async Task<bool> UserExistsAsync(string subject)
    {
        return await _context.Users.AnyAsync(z => z.Subject == subject);
    }
}
