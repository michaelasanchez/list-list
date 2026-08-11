namespace ListList.Api.Contracts;

public class Partition
{
    public Guid Id { get; set; }
    public string? Token { get; set; }

    public int Order { get; set; }

    public bool Checklist { get; set; } = false;
    public bool Owned { get; set; } = false;
    public bool Readonly { get; set; } = true;

    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public List<Node> Nodes { get; set; } = [];
    public List<ShareLink> ShareLinks { get; set; } = [];
}
