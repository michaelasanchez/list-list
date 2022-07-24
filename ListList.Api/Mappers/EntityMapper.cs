using AutoMapper;
using ListList.Api.Mappers.Interfaces;
using ListList.Data.Models.Interfaces;

namespace ListList.Api.Mappers
{
    public class EntityMapper<TEntity, TApi> : IEntityMapper<TEntity, TApi>
        where TEntity : IEntity
    {
        private readonly IMapper _autoMapper;

        public EntityMapper(IMapper autoMapper)
        {
            _autoMapper = autoMapper;
        }

        public TApi ToApi(TEntity entity)
        {
            return _autoMapper.Map<TApi>(entity);
        }

        public IEnumerable<TApi> ToApi(IEnumerable<TEntity> entities)
        {
            return _autoMapper.Map<IEnumerable<TApi>>(entities);
        }

        public TEntity ToDb(TApi resource)
        {
            return _autoMapper.Map<TEntity>(resource);
        }

        public IEnumerable<TEntity> ToDb(IEnumerable<TApi> entities)
        {
            return _autoMapper.Map<IEnumerable<TEntity>>(entities);
        }
    }
}
