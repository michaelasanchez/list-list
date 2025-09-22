namespace ListList.Api.Contracts.Post;

public class ItemCreation
{
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Complete { get; set; } = false;

    public Guid? OverId { get; set; }
    public Guid? ParentId { get; set; }
}