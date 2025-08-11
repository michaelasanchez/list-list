using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class HeaderProfile : Profile
{
    public HeaderProfile()
    {
        CreateMap<HeaderEntity, HeaderResource>()
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src =>
                ItemMapper.MapEntitiesToResources(src.Nodes.ToList())));

        CreateMap<HeaderResource, Header>();

        CreateMap<Header, HeaderEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.MapFrom(src => src.Items));

        CreateMap<ListHeaderCreation, HeaderEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.Ignore());

        CreateMap<ListHeaderPut, HeaderEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.Ignore());
    }
}
