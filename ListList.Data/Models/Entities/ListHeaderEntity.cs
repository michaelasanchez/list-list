namespace ListList.Data.Models.Entities;

public class ListHeaderEntity : BaseEntity
{
    public Guid UserId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool Deleted { get; set; } = false;
    public DateTimeOffset? DeletedOn { get; set; }

    public ICollection<ListItemEntity> ListItems { get; set; }
}
