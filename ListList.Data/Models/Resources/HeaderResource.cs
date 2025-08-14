namespace ListList.Data.Models.Resources;

public class HeaderResource
{
    public Guid? Id { get; set; }
    public string? Token { get; set; }

    public int Order { get; set; } = default;

    public bool? Checklist { get; set; }
    public bool? ReadOnly { get; set; }

    public string? Label { get; set; }
    public string? Description { get; set; }

    public List<ItemResource> Items { get; set; } = [];
    public List<ShareLinkResource> ShareLinks { get; set; } = [];
}
