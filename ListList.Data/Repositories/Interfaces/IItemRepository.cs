using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Data.Repositories.Interfaces;

public interface IItemRepository
{
    Task CompleteListItem(Guid listItemId);
    Task CreateListItem(NodeEntity creation, Guid parentId);
    Task DeleteListItem(Guid listItemId);
    Task<NodeEntity> GetListItemById(Guid listItemId);
    Task PatchListItem(Guid listItemId, ItemResource resource, bool? recursive);
    Task PutListItem(Guid listItemId, NodeEntity entityPut);
    Task RelocateListItem(Guid activeId, Guid overId, Guid? parentId);
}
