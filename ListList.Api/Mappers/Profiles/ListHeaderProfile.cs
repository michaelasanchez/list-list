using AutoMapper;
using ListList.Api.Contracts;
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
        }
    }
}
