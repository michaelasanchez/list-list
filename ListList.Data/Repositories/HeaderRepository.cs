using AutoMapper;
using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class HeaderRepository(ListListContext _context, IMapper _mapper) : IHeaderRepository
{
    public async Task CreateHeader(Guid ownerId, HeaderEntity creation)
    {
        var nextOrder = await _context.Headers.CountAsync() + 1;

        creation.OwnerId = ownerId;
        creation.Order = nextOrder;
        creation.Nodes = [];

        await _context.Headers.AddAsync(creation);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteHeader(Guid headerId)
    {
        var entity = await _context.Headers
            .SingleAsync(z => z.Id == headerId);

        var after = await _context.Headers
            .Where(z => z.Order > entity.Order)
            .ToListAsync();

        entity.Order = 0;
        entity.Deleted = true;
        entity.DeletedOn = DateTimeOffset.UtcNow;

        foreach (var item in after)
            item.Order--;

        await _context.SaveChangesAsync();
    }

    public async Task<HeaderResource> GetHeaderById(Guid? ownerId, Guid listHeaderId)
    {
        var entity = await GetQuery(ownerId)
            .Where(z => z.Id == listHeaderId)
            .SingleAsync();

        return _mapper.Map<HeaderResource>(entity);
    }

    public async Task<HeaderResource> GetHeaderByToken(string token)
    {
        var entity = await GetQuery()
            .Where(z => z.ShareLinks.Any(y => y.Token == token))
            .SingleAsync();

        var shareLink = entity.ShareLinks.Single(y => y.Token == token);

        var resource = _mapper.Map<HeaderResource>(entity);

        resource.Token = token;
        resource.ReadOnly = shareLink.Permission is not Models.Enums.SharedPermission.Edit;

        return resource;
    }

    public async Task<List<HeaderResource>> GetHeaders(Guid? ownerId)
    {
        var entities = await GetQuery(ownerId)
            .ToListAsync();

        return _mapper.Map<List<HeaderResource>>(entities);
    }

    public async Task PatchHeader(Guid headerId, HeaderResource resource)
    {
        var entity = await _context.Headers
            .SingleAsync(z => z.Id == headerId);

        var updateChecklist = resource.Checklist is not null && resource.Checklist.Value != entity.Checklist;
        var updateLabel = resource.Label is not null && resource.Label != entity.Label;
        var updateDescription = resource.Description is not null && resource.Description != entity.Description;

        if (updateChecklist || updateLabel || updateDescription)
        {
            if (resource.Checklist is not null)
            {
                entity.Checklist = resource.Checklist.Value;
            }

            if (resource.Label is not null)
            {
                entity.Label = resource.Label;
            }

            if (resource.Description is not null)
            {
                entity.Description = resource.Description;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task PutHeader(Guid listHeaderId, HeaderEntity listHeaderPut)
    {
        var existing = await _context.Headers
            .SingleOrDefaultAsync(z => z.Id == listHeaderId);

        if (existing != null)
        {
            existing.Label = listHeaderPut.Label;
            existing.Description = listHeaderPut.Description;
        }

        await _context.SaveChangesAsync();
    }

    public async Task RelocateHeader(Guid ownerId, Guid listHeaderId, int destinationIndex)
    {
        var listHeaders = await _context.Headers
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

    public async Task RestoreHeader(Guid ownerId, Guid headerId, int? order)
    {
        var entity = await _context.Headers
            .SingleAsync(z =>
                z.Id == headerId &&
                z.OwnerId == ownerId &&
                z.Deleted);

        var headers = await _context.Headers
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        var newOrder = order.HasValue && order.Value >= 0 && order.Value <= headers.Count
            ? order.Value
            : headers.Count;

        foreach (var item in headers.Where(z => z.Order >= newOrder))
            item.Order++;

        entity.Deleted = false;
        entity.DeletedOn = null;
        entity.Order = newOrder;

        await _context.SaveChangesAsync();
    }

    private IQueryable<HeaderEntity> GetQuery(Guid? ownerId = null)
    {
        var query = _context.Headers
            .Include(z => z.Nodes.Where(y => !y.Deleted))
            .Include(z => z.ShareLinks)
            .OrderBy(z => z.Order);

        return ownerId.HasValue
            ? query.Where(z => z.OwnerId == ownerId && !z.Deleted)
            : query.Where(z => !z.Deleted);
    }
}
