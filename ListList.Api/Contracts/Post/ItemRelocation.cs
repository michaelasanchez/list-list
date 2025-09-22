namespace ListList.Api.Contracts.Post;

public class ItemRelocation
{
    public Guid OverId { get; set; }
    public Guid? ParentId { get; set; }
    public int Depth { get; set; }
}
