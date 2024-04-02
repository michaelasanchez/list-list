using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Profiles
{
    public class ListHeaderProfile : Profile
    {
        public ListHeaderProfile()
        {
            CreateMap<ListHeaderEntity, ListHeader>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.ListItems));

            CreateMap<ListHeader, ListHeaderEntity>()
                .ForMember(dest => dest.ListItems, opt => opt.MapFrom(src => src.Items));

            CreateMap<ListItemCreation, ListHeaderEntity>()
                .ForMember(dest => dest.ListItems, opt => opt.MapFrom(src =>new List<ListItemEntity> {
                    new() {
                        Label = src.Label,
                        Left = 1,
                        Right = 2
                    }
                }));

        }
    }
}
