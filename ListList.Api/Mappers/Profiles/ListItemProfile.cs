using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Profiles;

public class ListItemProfile : Profile
{
    public ListItemProfile()
    {
        CreateMap<ListItemEntity, ListItem>()
            .ForMember(dest => dest.HeaderId, opt => opt.MapFrom(src => src.ListHeaderId));

        CreateMap<ListItem, ListItemEntity>()
            .ForMember(dest => dest.ListHeaderId, opt => opt.MapFrom(src => src.HeaderId));

        CreateMap<ListItemCreation, ListItemEntity>();

        CreateMap<ListItemPut, ListItemEntity>();
    }
}
