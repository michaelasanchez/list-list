using AutoMapper;
using ListList.Api.Models;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserEntity, User>();
        }
    }
}
