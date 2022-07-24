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

        public async Task<UserEntity?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users.SingleOrDefaultAsync(z => z.Username == username);
        }
    }
}
