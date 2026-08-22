namespace ListList.Api.Contracts.Post;

public class TreeNodeRelocation
{
    public Guid DestinationPartitionId { get; set; }
    public Guid? ParentId { get; set; }
    public int Order { get; set; }
}
