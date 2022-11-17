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
}
