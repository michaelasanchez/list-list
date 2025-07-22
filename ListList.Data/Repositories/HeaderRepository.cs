using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class HeaderRepository(ListListContext _context) : IHeaderRepository
{
    public async Task CreateListHeaderAsync(Guid userId, ListHeaderEntity creation)
    {
        var nextOrder = await _context.ListHeaders.CountAsync() + 1;

        creation.UserId = userId;
        creation.Order = nextOrder;
        creation.ListItems = [];

        await _context.ListHeaders.AddAsync(creation);
        await _context.SaveChangesAsync();
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

    public async Task PutListHeader(Guid listHeaderId, ListHeaderEntity listHeaderPut)
    {
        var existing = await _context.ListHeaders
            .SingleOrDefaultAsync(z => z.Id == listHeaderId);

        if (existing != null)
        {
            existing.Label = listHeaderPut.Label;
            existing.Description = listHeaderPut.Description;
        }

        await _context.SaveChangesAsync();
    }

    public async Task RelocateListHeaderAsync(Guid userId, Guid listHeaderId, int destinationIndex)
    {
        var listHeaders = await _context.ListHeaders
            .Where(z => z.UserId == userId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        var sourceIndex = listHeaders.FindIndex(z => z.Id == listHeaderId);
        if (sourceIndex == -1)
            throw new InvalidOperationException($"ListHeader with ID {listHeaderId} not found for user {userId}");

        var source = listHeaders[sourceIndex];

        listHeaders.RemoveAt(sourceIndex);
        listHeaders.Insert(destinationIndex, source);

        for (int i = 0; i < listHeaders.Count; i++)
            listHeaders[i].Order = i;

        await _context.SaveChangesAsync();
    }
}
