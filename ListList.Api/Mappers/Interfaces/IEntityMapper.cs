using ListList.Data.Models.Interfaces;

namespace ListList.Api.Mappers.Interfaces
{
    public interface IEntityMapper<TEntity, TApi>
        where TEntity : IEntity
    {
        TApi ToApi(TEntity entity);

        IEnumerable<TApi> ToApi(IEnumerable<TEntity> entities);

        TEntity ToDb(TApi resource);

        IEnumerable<TEntity> ToDb(IEnumerable<TApi> resource);
    }
}
