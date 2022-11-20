using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
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

            CreateMap<ListItemPut, ListItemEntity>();
        }
    }
}
