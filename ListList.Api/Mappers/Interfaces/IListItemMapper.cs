using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Interfaces
{
    public interface IListItemMapper : IEntityMapper<ListItemEntity, ListItem>
    {
        ListItemEntity ToDb(ListItemCreation creation);
    }
}
