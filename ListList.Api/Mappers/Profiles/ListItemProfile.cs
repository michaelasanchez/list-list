using AutoMapper;
using ListList.Api.Models;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Profiles
{
    public class ListItemProfile : Profile
    {
        public ListItemProfile()
        {
            CreateMap<ListItemEntity, ListItem>();

            CreateMap<ListItem, ListItemEntity>();
            CreateMap<ListItemCreation, ListItemEntity>();
        }
    }
}
