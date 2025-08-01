using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class ItemProfile : Profile
{
    public ItemProfile()
    {
        CreateMap<ListItemEntity, ItemResource>();

        CreateMap<ItemResource, Item>();

        CreateMap<Item, ListItemEntity>();

        CreateMap<ListItemCreation, ListItemEntity>();

        CreateMap<ListItemPut, ListItemEntity>();
    }
}
