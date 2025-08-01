namespace ListList.Data.Models.Entities;

public class HeaderEntity : BaseEntity
{
    public Guid OwnerId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool Deleted { get; set; } = false;
    public DateTimeOffset? DeletedOn { get; set; }

    public ICollection<ListItemEntity> ListItems { get; set; } = [];
    public ICollection<ShareLinkEntity> ShareLinks { get; set; } = [];
}
