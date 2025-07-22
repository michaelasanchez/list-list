using ListList.Api.Contracts;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers;

public class ListItemMapper
{
    public static List<ListItem> MapEntitiesToContracts(List<ListItemEntity> entities)
    {
        if (entities == null || entities.Count == 0)
        {
            return [];
        }

        var sortedEntities = entities.OrderBy(e => e.Left).ToList();

        var contracts = new List<ListItem>();
        var entityMap = sortedEntities.ToDictionary(e => e.Id);
        var contractMap = new Dictionary<Guid, ListItem>();
        var parentStack = new Stack<ListItemEntity>();

        foreach (var entity in sortedEntities)
        {
            var contract = new ListItem
            {
                Id = entity.Id,
                HeaderId = entity.ListHeaderId,
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

            contract.Depth = parentStack.Count;

            contract.ParentId = parentStack.Count != 0 ? parentStack.Peek().Id : null;

            contract.HasChildren = (entity.Right - entity.Left) > 1;
            contract.DescendantCount = (entity.Right - entity.Left - 1) / 2;

            contracts.Add(contract);
            contractMap.Add(contract.Id.Value, contract);

            parentStack.Push(entity);

        }

        foreach (var currentContract in contracts)
        {
            currentContract.ChildCount = contracts
                .Count(c => c.ParentId == currentContract.Id);

            currentContract.ChildrenIds = contracts
                .Where(z =>
                    z.Id is not null &&
                    z.ParentId == currentContract.Id!.Value)
                .Select(z => z.Id!.Value)
                .ToList();
        }

        return contracts;
    }
}
