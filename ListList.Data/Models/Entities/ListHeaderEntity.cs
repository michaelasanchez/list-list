using ListList.Data.Models.Entities;

namespace ListList.Data.Models.Entities;

public class ListHeaderEntity : BaseEntity
{
    public Guid UserId { get; set; }
    public int Order { get; set; }
    public bool Deleted { get; set; } = false;
    public DateTimeOffset? DeletedOn { get; set; }

    public ICollection<ListItemEntity> ListItems { get; set; }
}
