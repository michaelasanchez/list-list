using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class NodeProfile : Profile
{
    public NodeProfile()
    {

        CreateMap<NodeResource, Node>();

        CreateMap<NodeEntity, NodeResource>();

        CreateMap<NodeResource, NodeEntity>();

        CreateMap<Node, NodeEntity>();

        CreateMap<NodeCreation, NodeResource>();

        CreateMap<NodePatch, NodeResource>();

        CreateMap<NodePut, NodeEntity>();
    }
}
