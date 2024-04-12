using ListList.Data.Models.Entities;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class HeaderRepository(IListListContext _context) : IHeaderRepository
{
    public async Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation)
    {
        creation.UserId = userId;

        var nextOrder = await _context.ListHeaders.CountAsync() + 1;

        creation.Order = nextOrder;

        await _context.ListHeaders.AddAsync(creation);
    }

    public async Task<ListHeaderEntity> GetListHeaderByIdAsync(Guid userId, Guid listHeaderId)
    {
        return await _context.ListHeaders
            .Include(z => z.ListItems.Where(y => !y.Deleted))
            .Where(z => z.UserId == userId && z.Id == listHeaderId && !z.Deleted)
            .SingleAsync();
    }

    public async Task<List<ListHeaderEntity>> GetListHeadersAsync(Guid userId)
    {
        return await _context.ListHeaders
            .Include(z => z.ListItems.Where(y => !y.Deleted))
            .Where(z => z.UserId == userId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();
    }
}
