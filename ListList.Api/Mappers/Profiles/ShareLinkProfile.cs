using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Contracts.Put;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class ShareLinkProfile : Profile
{
    public ShareLinkProfile()
    {
        CreateMap<ShareLinkEntity, ShareLinkResource>();

        CreateMap<ShareLinkPut, ShareLinkResource>();

        CreateMap<ShareLinkResource, ShareLink>();
    }
}
