using AutoMapper;
using ListList.Api.Contracts;
using ListList.Api.Mappers.Interfaces;
using ListList.Data.Models.Entities;

namespace ListList.Api.Mappers
{
    public class UserMapper : EntityMapper<UserEntity, User>, IUserMapper
    {
        private readonly IMapper _autoMapper;

        public UserMapper(IMapper autoMapper)
            : base(autoMapper)
        {
            _autoMapper = autoMapper;
        }
    }
}
