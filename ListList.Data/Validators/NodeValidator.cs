using ListList.Data.Models;
using ListList.Data.Models.Interfaces;
using ListList.Data.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Validators;

public class NodeValidator(IListListContext _context) : INodeValidator
{
    public async Task IsDeleted(Guid nodeId, ValidationResult result)
    {
        var nodeIsNotDeleted = await _context.Nodes
            .AnyAsync(z => z.Id == nodeId && !z.Deleted);

        if (nodeIsNotDeleted)
        {
            result.AddError($"List node [{nodeId}] is deleted.");
        }
    }

    public async Task IsEmpty(Guid nodeId, ValidationResult result)
    {
        var targetNode = await _context.Nodes
            .Where(z => z.Id == nodeId)
            .Select(z => new { z.PartitionId, z.Left, z.Right })
            .SingleOrDefaultAsync();

        if (targetNode is not null)
        {
            var nodeNotEmpty = await _context.Nodes
                .AnyAsync(z =>
                    z.PartitionId == targetNode.PartitionId &&
                    z.Left > targetNode.Left &&
                    z.Right < targetNode.Right);

            if (nodeNotEmpty)
            {
                result.AddError($"List node is not empty.");
            }
        }
    }

    public async Task IsNotDeleted(Guid? nodeId, ValidationResult result)
    {
        var nodeIsDeleted = await _context.Nodes
            .AnyAsync(z => z.Id == nodeId && z.Deleted);

        if (nodeIsDeleted)
        {
            result.AddError($"List node [{nodeId}] is deleted.");
        }
    }

    public async Task IsValidIndex(Guid destinationParentId, int relativeIndex, ValidationResult result)
    {
        var parentQuery = from node in _context.Nodes
                          where node.Id == destinationParentId
                          select node;

        var parent = await parentQuery.SingleAsync();

        var directChildren =
            from child in _context.Nodes
            where child.Left > parent.Left && child.Right < parent.Right
            let ancestorCount =
                (from a in _context.Nodes
                 where a.Left < child.Left && a.Right > child.Right
                 select a).Count()
            let parentAncestorCount =
                (from a in _context.Nodes
                 where a.Left < parent.Left && a.Right > parent.Right
                 select a).Count()
            where ancestorCount == parentAncestorCount + 1
            select child;

        int directChildrenCount = directChildren.Count();

        if (relativeIndex >= 0 && relativeIndex < directChildrenCount)
        {
            result.AddError($"The {nameof(relativeIndex)} '{relativeIndex}' is invalid.");
        }
    }
}
