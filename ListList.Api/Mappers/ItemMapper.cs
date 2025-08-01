using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers;

public class ItemMapper
{
    public static List<ItemResource> MapEntitiesToResources(List<ListItemEntity> entities)
    {
        if (entities == null || entities.Count == 0)
        {
            return [];
        }

        var sortedEntities = entities.OrderBy(e => e.Left).ToList();

        var resources = new List<ItemResource>();
        var parentStack = new Stack<ListItemEntity>();

        foreach (var entity in sortedEntities)
        {
            var resource = new ItemResource
            {
                Id = entity.Id,
                HeaderId = entity.HeaderId,
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

            resource.Depth = parentStack.Count;

            resource.ParentId = parentStack.Count != 0 ? parentStack.Peek().Id : null;

            resource.HasChildren = (entity.Right - entity.Left) > 1;
            resource.DescendantCount = (entity.Right - entity.Left - 1) / 2;

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
