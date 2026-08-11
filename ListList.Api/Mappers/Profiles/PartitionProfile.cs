using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class PartitionProfile : Profile
{
    public PartitionProfile()
    {
        CreateMap<PartitionEntity, PartitionResource>()
            .ForMember(dest => dest.Nodes, opt => opt.MapFrom(src =>
                NodeMapper.MapEntitiesToResources(src.Nodes.ToList())));

        CreateMap<PartitionResource, Partition>();

        CreateMap<Partition, PartitionEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.MapFrom(src => src.Nodes));

        CreateMap<PartitionCreation, PartitionEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.Ignore());

        CreateMap<PartitionPatch, PartitionResource>();

        CreateMap<PartitionPut, PartitionEntity>()
            .ForMember(dest => dest.Nodes, opt => opt.Ignore());
    }
}
