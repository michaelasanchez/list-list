namespace ListList.Data.Models.Entities;

public class ItemEntity : BaseEntity
{
    public Guid HeaderId { get; set; } = default;

    public string? Label { get; set; }
    public string? Description { get; set; }

    public bool Complete { get; set; } = default;
    public DateTimeOffset? CompletedOn { get; set; }

    public bool Deleted { get; set; } = default;
    public DateTimeOffset? DeletedOn { get; set; }

    public int Left { get; set; } = default;
    public int Right { get; set; } = default;

    public HeaderEntity? Header { get; set; }
}
