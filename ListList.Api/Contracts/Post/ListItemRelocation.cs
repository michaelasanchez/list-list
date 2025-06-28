namespace ListList.Api.Contracts.Post;

public class ListItemRelocation
{
    public Guid ParentId { get; set; }
    public int RelativeIndex { get; set; }
}
