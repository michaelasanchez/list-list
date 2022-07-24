using AutoMapper;
using ListList.Api.Mappers.Interfaces;
using ListList.Api.Models;
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
    }
}
