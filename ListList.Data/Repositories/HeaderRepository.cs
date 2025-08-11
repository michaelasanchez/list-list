using AutoMapper;
using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class HeaderRepository(ListListContext _context, IMapper _mapper) : IHeaderRepository
{
    public async Task CreateListHeaderAsync(Guid ownerId, HeaderEntity creation)
    {
        var nextOrder = await _context.ListHeaders.CountAsync() + 1;

        creation.OwnerId = ownerId;
        creation.Order = nextOrder;
        creation.Nodes = [];

        await _context.ListHeaders.AddAsync(creation);
        await _context.SaveChangesAsync();
    }

    public async Task<HeaderResource> GetListHeaderByIdAsync(Guid? ownerId, Guid listHeaderId)
    {
        var entity = await GetQuery(ownerId)
            .Where(z => z.Id == listHeaderId)
            .SingleAsync();

        return _mapper.Map<HeaderResource>(entity);
    }

    public async Task<HeaderResource> GetListHeaderByToken(string token)
    {
        var entity = await GetQuery()
            .Where(z => z.ShareLinks.Any(y => y.Token == token))
            .SingleAsync();

        var shareLink = entity.ShareLinks.Single(y => y.Token == token);

        var resource = _mapper.Map<HeaderResource>(entity);

        resource.Token = token;
        resource.IsReadOnly = shareLink.Permission is not Models.Enums.SharedPermission.Edit;

        return resource;
    }

    public async Task<List<HeaderResource>> GetListHeadersAsync(Guid? ownerId)
    {
        var entities = await GetQuery(ownerId)
            .ToListAsync();

        return _mapper.Map<List<HeaderResource>>(entities);
    }

    public async Task PutListHeader(Guid listHeaderId, HeaderEntity listHeaderPut)
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

    public async Task RelocateListHeaderAsync(Guid ownerId, Guid listHeaderId, int destinationIndex)
    {
        var listHeaders = await _context.ListHeaders
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        var sourceIndex = listHeaders.FindIndex(z => z.Id == listHeaderId);
        if (sourceIndex == -1)
            throw new InvalidOperationException($"ListHeader with ID {listHeaderId} not found for user {ownerId}");

        var source = listHeaders[sourceIndex];

        listHeaders.RemoveAt(sourceIndex);
        listHeaders.Insert(destinationIndex, source);

        for (int i = 0; i < listHeaders.Count; i++)
            listHeaders[i].Order = i;

        await _context.SaveChangesAsync();
    }

    private IQueryable<HeaderEntity> GetQuery(Guid? ownerId = null)
    {
        var query = _context.ListHeaders
            .Include(z => z.Nodes.Where(y => !y.Deleted))
            .Include(z => z.ShareLinks)
            .OrderBy(z => z.Order);

        return ownerId.HasValue
            ? query.Where(z => z.OwnerId == ownerId && !z.Deleted)
            : query.Where(z => !z.Deleted);
    }
}
