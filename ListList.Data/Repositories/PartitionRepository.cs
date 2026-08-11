using AutoMapper;
using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class PartitionRepository(ListListContext context, IMapper mapper) : BaseRepository(context, mapper), IPartitionRepository
{
    public async Task CreatePartition(Guid ownerId, PartitionEntity creation, int? order)
    {
        var nextOrder = order ?? await _context.Partitions.CountAsync(z => !z.Deleted);

        creation.OwnerId = ownerId;
        creation.Order = nextOrder;
        creation.Nodes = [];

        await _context.Partitions.AddAsync(creation);

        if (order.HasValue)
        {
            var after = await _context.Partitions
                .Where(z => z.OwnerId == ownerId && z.Order >= order && !z.Deleted)
                .ToListAsync();

            foreach (var node in after)
                node.Order++;
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeletePartition(string token)
    {
        var partitionId = await GetPartitionId(token);

        var entity = await _context.Partitions
            .SingleAsync(z => z.Id == partitionId);

        var after = await _context.Partitions
            .Where(z => z.Order > entity.Order)
            .ToListAsync();

        entity.Order = 0;
        entity.Deleted = true;
        entity.DeletedOn = DateTimeOffset.UtcNow;

        foreach (var node in after)
            node.Order--;

        await _context.SaveChangesAsync();
    }

    public async Task<PartitionResource> GetPartition(Guid? userId, string token)
    {
        var query = GetQuery();

        var parsed = Guid.TryParse(token, out var id);

        query = parsed ?
            query.Where(z => z.Id == id) :
            query.Where(z => z.ShareLinks.Any(y => y.Token == token));

        var entity = await query.SingleAsync();

        var shareLink = entity.ShareLinks.SingleOrDefault(y => y.Token == token);

        var resource = _mapper.Map<PartitionResource>(entity);

        var isOwner = userId == entity.OwnerId;
        var canEdit = isOwner || (shareLink is not null && shareLink.Permission is Models.Enums.SharedPermission.Edit);

        resource.Token = token;
        resource.Owned = isOwner;
        resource.ReadOnly = !canEdit;

        return resource;
    }

    public async Task<List<PartitionResource>> GetPartitions(Guid? ownerId)
    {
        var entities = await GetQuery(ownerId)
            .ToListAsync();

        return _mapper.Map<List<PartitionResource>>(entities);
    }

    public async Task PatchPartition(string token, PartitionResource resource)
    {
        var partitionId = await GetPartitionId(token);

        var entity = await _context.Partitions
            .SingleAsync(z => z.Id == partitionId);

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

    public async Task PutPartition(string token, PartitionEntity listPartitionPut)
    {
        var partitionId = await GetPartitionId(token);

        var existing = await _context.Partitions
            .SingleOrDefaultAsync(z => z.Id == partitionId);

        if (existing != null)
        {
            existing.Label = listPartitionPut.Label;
            existing.Description = listPartitionPut.Description;
        }

        await _context.SaveChangesAsync();
    }

    public async Task RelocatePartition(Guid ownerId, string token, int destinationIndex)
    {
        var partitionId = await GetPartitionId(token);

        var listPartitions = await _context.Partitions
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        var sourceIndex = listPartitions.FindIndex(z => z.Id == partitionId);

        if (sourceIndex == -1)
            throw new InvalidOperationException($"ListPartition with ID {partitionId} not found for user {ownerId}");

        var source = listPartitions[sourceIndex];

        listPartitions.RemoveAt(sourceIndex);
        listPartitions.Insert(destinationIndex, source);

        for (int i = 0; i < listPartitions.Count; i++)
            listPartitions[i].Order = i;

        await _context.SaveChangesAsync();
    }

    public async Task RestorePartition(Guid ownerId, string token, int? order)
    {
        var partitionId = await GetPartitionId(token);

        var entity = await _context.Partitions
            .SingleAsync(z =>
                z.Id == partitionId &&
                z.OwnerId == ownerId &&
                z.Deleted);

        var partitions = await _context.Partitions
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        var newOrder = order.HasValue && order.Value >= 0 && order.Value <= partitions.Count
            ? order.Value
            : partitions.Count;

        foreach (var node in partitions.Where(z => z.Order >= newOrder))
            node.Order++;

        entity.Deleted = false;
        entity.DeletedOn = null;
        entity.Order = newOrder;

        await _context.SaveChangesAsync();
    }

    private IQueryable<PartitionEntity> GetQuery(Guid? ownerId = null)
    {
        var query = _context.Partitions
            .Include(z => z.Nodes.Where(y => !y.Deleted))
            .Include(z => z.ShareLinks)
            .OrderBy(z => z.Order);

        return ownerId.HasValue
            ? query.Where(z => z.OwnerId == ownerId && !z.Deleted)
            : query.Where(z => !z.Deleted);
    }
}
