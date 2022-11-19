using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Mappers.Interfaces;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers
{
    public class ListItemMapper : EntityMapper<ListItemEntity, ListItem>, IListItemMapper
    {
        private readonly IMapper _autoMapper;

        public ListItemMapper(IMapper autoMapper)
            : base(autoMapper)
        {
            _autoMapper = autoMapper;
        }

        public ListItemEntity ToDb(ListItemCreation creation)
        {
            return _autoMapper.Map<ListItemEntity>(creation);
        }
    }
}
