using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IListListContext _context;

        public UserRepository(IListListContext context)
        {
            _context = context;
        }

        public async Task AddUserAsync(UserEntity user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task CreateUserAsync(string subject)
        {
            var user = new UserEntity { Subject = subject };

            await _context.Users.AddAsync(user);
        }

        public async Task<UserEntity?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.SingleOrDefaultAsync(z => z.Username == username);
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
}
