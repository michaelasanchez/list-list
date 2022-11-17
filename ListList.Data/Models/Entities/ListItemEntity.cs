namespace ListList.Data.Models.Entities;

public class ListItemEntity : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid GroupId { get; set; }

    public string? Label { get; set; }
    public string? Description { get; set; }

    public bool Accomplishable { get; set; }
    public bool Complete { get; set; }
    public DateTimeOffset? CompletedOn { get; set; }

    public bool Deleted { get; set; }
    public DateTimeOffset? DeletedOn { get; set; }

    public int Left { get; set; }
    public int Right { get; set; }
}
