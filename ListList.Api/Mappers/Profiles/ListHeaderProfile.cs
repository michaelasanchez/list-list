﻿using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Post;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Profiles;

public class ListHeaderProfile : Profile
{
    public ListHeaderProfile()
    {
        CreateMap<ListHeaderEntity, ListHeader>()
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src =>
                ListItemMapper.MapEntitiesToContracts(src.ListItems.ToList())));

        CreateMap<ListHeader, ListHeaderEntity>()
            .ForMember(dest => dest.ListItems, opt => opt.MapFrom(src => src.Items));

        CreateMap<ListHeaderCreation, ListHeaderEntity>()
            .ForMember(dest => dest.ListItems, opt => opt.Ignore());

        CreateMap<ListHeaderPut, ListHeaderEntity>()
            .ForMember(dest => dest.ListItems, opt => opt.Ignore());
    }
}
