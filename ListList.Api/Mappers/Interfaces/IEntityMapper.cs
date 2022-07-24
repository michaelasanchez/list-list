using ListList.Data.Models.Interfaces;

namespace ListList.Api.Mappers.Interfaces
{
    public interface IEntityMapper<TEntity, TApi>
        where TEntity : IEntity
    {
        TApi Map(TEntity entity);

        IEnumerable<TApi> Map(IEnumerable<TEntity> entities);
    }
}
