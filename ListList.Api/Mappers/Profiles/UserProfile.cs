using AutoMapper;
using ListList.Api.Contracts;
using ListList.Data.Models.Entities;
using ListList.Data.Models.Resources;

namespace ListList.Api.Mappers.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserEntity, UserResource>();
            CreateMap<UserResource, User>();
        }
    }
}
