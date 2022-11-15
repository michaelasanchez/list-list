using ListList.Data.Models.Entities;

namespace ListList.Data.Models.Entities;

public class ListHeaderEntity : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = "";

    public ICollection<ListItemEntity> ListItems { get; set; }
}
