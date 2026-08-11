using AutoMapper;
using ListList.Data.Extensions;
using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class NodeRepository(ListListContext context, IMapper mapper) : BaseRepository(context, mapper), INodeRepository
{
    public async Task CompleteNode(Guid nodeId)
    {
        var node = await _context.Nodes.SingleAsync(z => z.Id == nodeId);

        node.Complete = !node.Complete;

        if (node.Complete)
        {
            node.CompletedOn = DateTime.UtcNow;
        }
        else
        {
            node.CompletedOn = null;
        }
    }

    public async Task<Guid> CreateNode(NodeResource creation, string token, Guid? overId, Guid? parentId)
    {
        var active = _mapper.Map<NodeEntity>(creation);

        active.PartitionId = await GetPartitionId(token);
        active.Left = 1;
        active.Right = 2;

        await InsertNode([active], parentId, overId);

        await _context.Nodes.AddAsync(active);
        await _context.SaveChangesAsync();

        return active.Id;
    }

    public async Task DeleteNode(Guid nodeId)
    {
        var activeNode = await _context.Nodes.SingleAsync(z => z.Id == nodeId);

        var removed = await RemoveNode(activeNode);

        foreach (var node in removed)
        {
            node.Left = 0;
            node.Right = 0;
            node.Deleted = true;
            node.DeletedOn = DateTime.UtcNow;
        }
    }

    public async Task<NodeResource> GetNodeById(Guid nodeId)
    {
        var entity = await _context.Nodes
            .Where(z => z.Id == nodeId)
            .SingleAsync();

        var ancestorIds = entity.Left > 1
            ? await _context.Nodes
                .Where(z =>
                    z.PartitionId == entity.PartitionId &&
                    z.Left < entity.Left &&
                    z.Right > entity.Right &&
                    !z.Deleted)
                .OrderBy(z => z.Left)
                .Select(z => z.Id)
                .ToListAsync()
            : [];

        var descendantIds = entity.IsParent()
            ? await _context.Nodes
                .Where(z =>
                    z.PartitionId == entity.PartitionId &&
                    z.Left > entity.Left &&
                    z.Right < entity.Right &&
                    !z.Deleted)
                .OrderBy(z => z.Left)
                .Select(z => z.Id)
                .ToListAsync()
            : [];

        return MapResource(entity, ancestorIds, descendantIds);
    }

    private static NodeResource MapResource(NodeEntity entity, List<Guid> ancestorIds, List<Guid> descendantIds) => new()
    {
        Id = entity.Id,
        Label = entity.Label,
        Description = entity.Description,
        Complete = entity.Complete,
        CompletedOn = entity.CompletedOn,
        Left = entity.Left,
        Right = entity.Right,
        Depth = ancestorIds.Count,
        PartitionId = entity.PartitionId,
        ParentId = ancestorIds.Count > 0 ? ancestorIds.Last() : null,
        //ChildrenIds = descendantIds,
        IsParent = entity.IsParent(),
        //ChildCount = 0,
        DescendantCount = entity.DescendantCount()
    };

    public async Task PatchNode(Guid nodeId, NodeResource resource, bool? recursive)
    {
        var active = await _context.Nodes.SingleAsync(z => z.Id == nodeId);

        var entities = new List<NodeEntity> { active };

        if (recursive is true && active.IsParent())
        {
            var query = _context.Nodes
                .Where(z => z.Left > resource.Left && z.Right <= resource.Right && !z.Deleted);

            var descendants = await query.ToListAsync();

            entities.AddRange(descendants);
        }

        foreach (var entity in entities)
        {
            if (resource.Label is not null)
            {
                entity.Label = resource.Label;
            }

            if (resource.Description is not null)
            {
                entity.Description = resource.Description;
            }

            if (resource.Complete is not null)
            {
                if (resource.Complete is true && !entity.Complete)
                {
                    entity.CompletedOn = DateTime.UtcNow;
                }

                entity.Complete = resource.Complete.Value;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task PutNode(Guid nodeId, NodeEntity entityPut)
    {
        var entity = await _context.Nodes.SingleAsync(z => z.Id == nodeId);

        entity.Label = entityPut.Label;
        entity.Description = entityPut.Description;

        await _context.SaveChangesAsync();
    }

    public async Task RelocateNode(Guid activeId, Guid overId, Guid? parentId)
    {
        var active = await _context.Nodes
            .SingleAsync(z => z.Id == activeId);

        var over = await _context.Nodes
            .SingleAsync(z => z.Id == overId);

        var useNext = active.Left < over.Left;

        var nextId = await _context.Nodes
            .Where(z =>
                z.PartitionId == active.PartitionId &&
                z.Left > (useNext ? over.Right : active.Right) &&
                !z.Deleted)
            .OrderBy(z => z.Left)
            .Select(z => (Guid?)z.Id)
            .FirstOrDefaultAsync();

        var relocating = await RemoveNode(active);

        ReindexSubtree(relocating);

        _context.RemoveRange(relocating);

        await _context.SaveChangesAsync();

        await InsertNode(relocating, parentId, activeId == overId || useNext ? nextId : over.Id);

        _context.Nodes.AddRange(relocating);

        await _context.SaveChangesAsync();
    }

    public async Task RestoreNode(Guid nodeId, Guid? overId, Guid? parentId)
    {
        var active = await _context.Nodes.SingleAsync(z => z.Id == nodeId);

        active.Left = 1;
        active.Right = 2;
        active.Deleted = false;
        active.DeletedOn = null;

        await InsertNode([active], parentId, overId);

        await _context.SaveChangesAsync();
    }

    private async Task<List<NodeEntity>> GetDescendants(NodeEntity parent)
    {
        return await _context.Nodes
            .Where(z =>
                z.PartitionId == parent.PartitionId &&
                z.Left > parent.Left &&
                z.Right < parent.Right &&
                !z.Deleted)
            .ToListAsync();
    }

    private async Task<int> GetInsertionPoint(Guid listPartitionId, Guid? parentId, Guid? overId)
    {
        var over = overId is null ? null :
            await _context.Nodes
                .AsNoTracking()
                .Where(z => z.Id == overId)
                .SingleOrDefaultAsync();

        var parent = parentId is null ? null :
            await _context.Nodes
                .AsNoTracking()
                .Where(z => z.Id == parentId)
                .SingleOrDefaultAsync();

        var maxRight = await _context.Nodes
            .AsNoTracking()
            .Where(z => z.PartitionId == listPartitionId && !z.Deleted)
            .OrderByDescending(z => z.Right)
            .Select(z => (int?)z.Right)
            .FirstOrDefaultAsync();

        var all = await _context.Nodes.Where(z => z.PartitionId == listPartitionId && !z.Deleted).ToListAsync();

        var partOfTheMess = maxRight is null ? 0 : maxRight.Value + 1;

        var leftBoundary =
            over is null && parent is null

            ?
        partOfTheMess
:
        Math.Min(
            over?.Left ?? parent?.Right ?? 0,
            parent?.Right ?? over?.Left ?? 0
        );

        return leftBoundary;
    }

    // TODO: DEBUG
    public async Task InsertNodeDebug(List<NodeEntity> active, Guid? parentId, Guid? overId = null)
        => await InsertNode(active, parentId, overId);

    private async Task InsertNode(List<NodeEntity> active, Guid? parentId, Guid? overId = null)
    {
        if (active is null or [])
        {
            return;
        }

        var listPartitionId = active.First().PartitionId;
        var spaceNeeded = active.Count * 2;

        var insertionPoint = await GetInsertionPoint(listPartitionId, parentId, overId);

        await ShiftExistingNodes(listPartitionId, insertionPoint, spaceNeeded);

        var positioningOffset = Math.Max(insertionPoint - 1, 0);

        foreach (var node in active)
        {
            node.Left += positioningOffset;
            node.Right += positioningOffset;
        }
    }

    private async Task<List<NodeEntity>> RemoveNode(NodeEntity active)
    {
        var removeCount = (active.Right - active.Left + 1) / 2;

        var descendants = await GetDescendants(active);

        var subsequent = await _context.Nodes
            .Where(z =>
                z.Id != active.Id &&
                z.PartitionId == active.PartitionId &&
                z.Right > active.Right &&
                !z.Deleted)
            .ToListAsync();

        foreach (var node in subsequent)
        {
            if (node.Left > active.Left)
            {
                node.Left -= removeCount * 2;
            }

            node.Right -= removeCount * 2;
        }

        return [active, .. descendants];
    }

    private async Task ShiftExistingNodes(Guid listPartitionId, int insertionPoint, int spaceNeeded)
    {
        var nodes = await _context.Nodes
            .Where(z =>
                z.PartitionId == listPartitionId &&
                z.Right >= insertionPoint &&
                !z.Deleted)
            .OrderBy(z => z.Left)
            .ToListAsync();

        foreach (var node in nodes)
        {
            if (node.Left >= insertionPoint)
            {
                node.Left += spaceNeeded;
            }

            node.Right += spaceNeeded;
        }
    }

    private static void ReindexSubtree(List<NodeEntity> nodes)
    {
        if (nodes is not { Count: > 0 })
        {
            return;
        }

        var diff = nodes.Min(z => z.Left) - 1;

        foreach (var node in nodes)
        {
            node.Left -= diff;
            node.Right -= diff;
        }
    }
}
