using ListList.Data.Models.Interfaces;

namespace ListList.Data.Models.Entities
{
    public class BaseEntity : IEntity, IDated
    {
        public Guid Id { get; set; }
        public DateTimeOffset Created { get; set; }
        public DateTimeOffset? Updated { get; set; }
    }
}
