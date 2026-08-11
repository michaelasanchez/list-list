using ListList.Data.Extensions;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers;

public class NodeMapper
{
    public static List<NodeResource> MapEntitiesToResources(List<NodeEntity> entities)
    {
        if (entities == null || entities.Count == 0)
        {
            return [];
        }

        var sortedEntities = entities.OrderBy(e => e.Left).ToList();

        var resources = new List<NodeResource>();
        var parentStack = new Stack<NodeEntity>();

        foreach (var entity in sortedEntities)
        {
            var resource = new NodeResource
            {
                Id = entity.Id,
                PartitionId = entity.PartitionId,
                Label = entity.Label,
                Description = entity.Description,
                Complete = entity.Complete,
                CompletedOn = entity.CompletedOn,
                Left = entity.Left,
                Right = entity.Right
            };

            while (parentStack.Count != 0 && parentStack.Peek().Right < entity.Right)
            {
                parentStack.Pop();
            }

            resource.ParentId = parentStack.Count != 0 ? parentStack.Peek().Id : null;

            resource.IsParent = entity.IsParent();
            resource.DescendantCount = entity.DescendantCount();

            resource.Depth = parentStack.Count;
            resource.Index = resources.Where(z => z.ParentId == resource.ParentId).Count();

            resources.Add(resource);

            parentStack.Push(entity);
        }

        foreach (var resource in resources)
        {
            resource.ChildCount = resources
                .Count(c => c.ParentId == resource.Id);

            resource.ChildrenIds = resources
                .Where(z =>
                    z.Id is not null &&
                    z.ParentId == resource.Id!.Value)
                .Select(z => z.Id!.Value)
                .ToList();
        }

        return resources;
    }
}
