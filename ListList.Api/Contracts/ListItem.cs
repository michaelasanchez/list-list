namespace ListList.Api.Contracts;

public class ListItem
{
    public Guid? Id { get; set; }
    public string? Label { get; set; }
    public string? Description { get; set; }
    public bool Complete { get; set; }
    public DateTimeOffset? CompletedOn { get; set; }

    public int Left { get; set; }
    public int Right { get; set; }

    public int Depth { get; set; }
    public bool IsRoot { get; set; }

    public Guid HeaderId { get; set; }
    public Guid? ParentId { get; set; }
    public List<Guid> ChildrenIds { get; set; }

    public bool HasChildren { get; set; }
    public int ChildCount { get; set; }
    public int DescendantCount { get; set; }
}
