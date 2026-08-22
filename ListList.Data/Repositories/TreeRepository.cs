using ListList.Data.Models;
using ListList.Data.Models.Entities;
using ListList.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class TreeRepository(ListListContext context) : ITreeRepository
{
    private readonly ListListContext _context = context;

    public Task RelocateNode(Guid ownerId, string sourceToken, Guid nodeId, Guid destinationPartitionId, Guid? parentId, int order)
        => MoveNode(ownerId, sourceToken, nodeId, destinationPartitionId, parentId, order, false);

    public Task CopyNode(Guid ownerId, string sourceToken, Guid nodeId, Guid destinationPartitionId, Guid? parentId, int order)
        => MoveNode(ownerId, sourceToken, nodeId, destinationPartitionId, parentId, order, true);

    public async Task<Guid> PromoteNode(Guid ownerId, string sourceToken, Guid nodeId, int order)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var source = await GetPartition(ownerId, sourceToken);
        var root = await GetNode(source.Id, nodeId);
        var subtree = await GetSubtree(root);
        var descendants = subtree.Where(z => z.Id != root.Id).ToList();

        await CloseGap(source.Id, root, subtree.Count);

        var partition = new PartitionEntity
        {
            Id = root.Id,
            OwnerId = ownerId,
            Label = root.Label ?? string.Empty,
            Description = root.Description ?? string.Empty,
            Order = order,
        };

        var offset = root.Left;

        foreach (var node in descendants)
        {
            node.PartitionId = partition.Id;
            node.Left -= offset;
            node.Right -= offset;
        }

        var partitions = _context.Partitions
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order);

        order = Math.Clamp(order, 0, Math.Max(0, await partitions.CountAsync() - 1));

        await _context.Partitions
            .Where(x => x.OwnerId == ownerId && !x.Deleted && x.Order >= order)
            .ExecuteUpdateAsync(x => x.SetProperty(z => z.Order, z => z.Order + 1));

        _context.Nodes.Remove(root);
        _context.Partitions.Add(partition);

        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
        return partition.Id;
    }

    public async Task RelocatePartition(Guid ownerId, string sourceToken, int order)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var partition = await GetPartition(ownerId, sourceToken);
        var partitions = await _context.Partitions
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order)
            .ToListAsync();

        order = Math.Clamp(order, 0, Math.Max(0, partitions.Count - 1));
        partitions.Remove(partition);
        partitions.Insert(order, partition);
        for (var index = 0; index < partitions.Count; index++)
        {
            partitions[index].Order = index;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    public async Task<Guid> CopyPartition(Guid ownerId, string sourceToken, int order)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var source = await GetPartition(ownerId, sourceToken);
        var nodes = await _context.Nodes
            .Where(z => z.PartitionId == source.Id && !z.Deleted)
            .OrderBy(z => z.Left)
            .AsNoTracking()
            .ToListAsync();

        var partition = new PartitionEntity
        {
            OwnerId = ownerId,
            Label = source.Label,
            Description = source.Description,
            Checklist = source.Checklist,
            Order = order,
        };

        var partitions = _context.Partitions
            .Where(z => z.OwnerId == ownerId && !z.Deleted)
            .OrderBy(z => z.Order);

        order = Math.Clamp(order, 0, Math.Max(0, await partitions.CountAsync() - 1));

        await _context.Partitions
            .Where(x => x.OwnerId == ownerId && !x.Deleted && x.Order >= order)
            .ExecuteUpdateAsync(x => x.SetProperty(z => z.Order, z => z.Order + 1));

        _context.Partitions.Add(partition);
        _context.Nodes.AddRange(CloneNodes(nodes, partition.Id));
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return partition.Id;
    }

    public async Task DemotePartition(Guid ownerId, string sourceToken, Guid destinationPartitionId, Guid? parentId, int order)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var source = await GetPartition(ownerId, sourceToken);
        var destination = await GetPartition(ownerId, destinationPartitionId.ToString());
        if (source.Id == destination.Id)
        {
            throw new InvalidOperationException("A partition cannot be demoted into itself.");
        }

        var nodes = await _context.Nodes
            .Where(z => z.PartitionId == source.Id && !z.Deleted)
            .OrderBy(z => z.Left)
            .ToListAsync();

        var wrapper = new NodeEntity
        {
            PartitionId = destination.Id,
            Label = source.Label,
            Description = source.Description,
            Left = 1,
            Right = nodes.Count * 2 + 2,
        };

        foreach (var node in nodes)
        {
            node.PartitionId = destination.Id;
            node.Left++;
            node.Right++;
        }

        _context.Nodes.Add(wrapper);

        await InsertSubtree(destination.Id, [wrapper, .. nodes], parentId, order, nodes.Select(z => z.Id).ToHashSet());

        _context.Partitions.Remove(source);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    private async Task MoveNode(Guid ownerId, string sourceToken, Guid nodeId, Guid destinationPartitionId, Guid? parentId, int order, bool copy)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var source = await GetPartition(ownerId, sourceToken);
        var destination = await GetPartition(ownerId, destinationPartitionId.ToString());
        var root = await GetNode(source.Id, nodeId);
        var subtree = await GetSubtree(root);

        if (parentId is not null && subtree.Any(z => z.Id == parentId))
        {
            throw new InvalidOperationException("A node cannot become a child of itself or its descendants.");
        }

        if (copy)
        {
            var copies = CloneNodes(subtree, destination.Id);

            await InsertSubtree(destination.Id, copies, parentId, order);

            _context.Nodes.AddRange(copies);
        }
        else
        {
            await CloseGap(source.Id, root, subtree.Count);

            foreach (var node in subtree)
            {
                node.PartitionId = destination.Id;
            }

            await InsertSubtree(destination.Id, subtree, parentId, order, subtree.Select(z => z.Id).ToHashSet());
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    private async Task<PartitionEntity> GetPartition(Guid ownerId, string token)
    {
        var partition = Guid.TryParse(token, out var id)
            ? await _context.Partitions.SingleOrDefaultAsync(z => z.Id == id && !z.Deleted)
            : await _context.Partitions.SingleOrDefaultAsync(z => !z.Deleted && z.ShareLinks.Any(y => y.Token == token));

        if (partition is null || partition.OwnerId != ownerId)
        {
            throw new InvalidOperationException("The partition was not found or is not owned by the current user.");
        }

        return partition;
    }

    private async Task<NodeEntity> GetNode(Guid partitionId, Guid nodeId)
        => await _context.Nodes.SingleOrDefaultAsync(z => z.Id == nodeId && z.PartitionId == partitionId && !z.Deleted)
           ?? throw new InvalidOperationException("The node was not found in the source partition.");

    private async Task<List<NodeEntity>> GetSubtree(NodeEntity root)
        => await _context.Nodes
            .Where(z => z.PartitionId == root.PartitionId && !z.Deleted && z.Left >= root.Left && z.Right <= root.Right)
            .OrderBy(z => z.Left)
            .ToListAsync();

    private async Task CloseGap(Guid partitionId, NodeEntity root, int nodeCount)
    {
        var width = nodeCount * 2;
        await _context.Nodes
            .Where(z => z.PartitionId == partitionId && !z.Deleted && z.Right > root.Right)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(z => z.Left, z => z.Left > root.Right ? z.Left - width : z.Left)
                .SetProperty(z => z.Right, z => z.Right - width));
    }

    private async Task InsertSubtree(Guid partitionId, List<NodeEntity> subtree, Guid? parentId, int order, HashSet<Guid>? excludedIds = null)
    {
        var existing = await _context.Nodes
            .Where(z => z.PartitionId == partitionId && !z.Deleted && (excludedIds == null || !excludedIds.Contains(z.Id)))
            .OrderBy(z => z.Left)
            .AsNoTracking()
            .ToListAsync();
        var insertionPoint = GetInsertionPoint(existing, parentId, order);
        var width = subtree.Count * 2;

        await _context.Nodes
            .Where(z => z.PartitionId == partitionId && !z.Deleted && (excludedIds == null || !excludedIds.Contains(z.Id)) && z.Right >= insertionPoint)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(z => z.Left, z => z.Left >= insertionPoint ? z.Left + width : z.Left)
                .SetProperty(z => z.Right, z => z.Right + width));

        var minimum = subtree.Min(z => z.Left);
        var offset = insertionPoint - minimum;
        foreach (var node in subtree)
        {
            node.Left += offset;
            node.Right += offset;
        }
    }

    private static int GetInsertionPoint(List<NodeEntity> nodes, Guid? parentId, int order)
    {
        if (parentId is null)
        {
            var roots = GetRoots(nodes);
            return roots.Count == 0 || order >= roots.Count ? (nodes.Count == 0 ? 1 : nodes.Max(z => z.Right) + 1) : roots[Math.Max(order, 0)].Left;
        }

        var parent = nodes.SingleOrDefault(z => z.Id == parentId)
            ?? throw new InvalidOperationException("The destination parent was not found.");
        var children = GetChildren(nodes, parent);
        return children.Count == 0 || order >= children.Count ? parent.Right : children[Math.Max(order, 0)].Left;
    }

    private static List<NodeEntity> GetRoots(List<NodeEntity> nodes)
        => nodes.Where(node => !nodes.Any(parent => parent.Left < node.Left && parent.Right > node.Right)).OrderBy(z => z.Left).ToList();

    private static List<NodeEntity> GetChildren(List<NodeEntity> nodes, NodeEntity parent)
        => nodes.Where(node => node.Left > parent.Left && node.Right < parent.Right && !nodes.Any(candidate => candidate.Id != node.Id && candidate.Left > parent.Left && candidate.Right < parent.Right && candidate.Left < node.Left && candidate.Right > node.Right)).OrderBy(z => z.Left).ToList();

    private static List<NodeEntity> CloneNodes(List<NodeEntity> source, Guid partitionId)
    {
        var map = source.ToDictionary(z => z.Id, _ => Guid.NewGuid());
        return source.Select(z => new NodeEntity
        {
            Id = map[z.Id],
            PartitionId = partitionId,
            Label = z.Label,
            Description = z.Description,
            Complete = z.Complete,
            CompletedOn = z.CompletedOn,
            Left = z.Left,
            Right = z.Right,
        }).ToList();
    }
}