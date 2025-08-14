namespace ListList.Data.Models.Entities;

public class HeaderEntity : BaseEntity
{
    public Guid OwnerId { get; set; }

    public int Order { get; set; } = default;

    public bool Checklist { get; set; } = false;

    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public bool Deleted { get; set; } = false;
    public DateTimeOffset? DeletedOn { get; set; }

    public ICollection<ItemEntity> Nodes { get; set; } = [];
    public ICollection<ShareLinkEntity> ShareLinks { get; set; } = [];
}
