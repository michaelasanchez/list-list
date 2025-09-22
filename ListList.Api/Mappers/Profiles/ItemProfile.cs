using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Patch;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class ItemProfile : Profile
{
    public ItemProfile()
    {

        CreateMap<ItemResource, Item>();

        CreateMap<ItemEntity, ItemResource>();

        CreateMap<ItemResource, ItemEntity>();

        CreateMap<Item, ItemEntity>();

        CreateMap<ItemCreation, ItemResource>();

        CreateMap<ItemPatch, ItemResource>();

        CreateMap<ItemPut, ItemEntity>();
    }
}
