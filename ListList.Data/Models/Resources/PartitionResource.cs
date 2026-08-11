namespace ListList.Data.Models.Resources;

public class PartitionResource
{
    public Guid? Id { get; set; }
    public string? Token { get; set; }

    public int Order { get; set; } = default;

    public bool? Checklist { get; set; }
    public bool? ReadOnly { get; set; }
    public bool? Owned { get; set; }

    public string? Label { get; set; }
    public string? Description { get; set; }

    public List<NodeResource> Nodes { get; set; } = [];
    public List<ShareLinkResource> ShareLinks { get; set; } = [];
}
