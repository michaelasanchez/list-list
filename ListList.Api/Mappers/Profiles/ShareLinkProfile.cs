using AutoMapper;
using ListList.Api.Contracts;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles;

public class ShareLinkProfile : Profile
{
    public ShareLinkProfile()
    {
        CreateMap<ShareLinkEntity, ShareLinkResource>();

        CreateMap<ShareLinkResource, ShareLink>();
    }
}
