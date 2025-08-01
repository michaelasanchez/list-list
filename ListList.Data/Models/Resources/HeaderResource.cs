namespace ListList.Data.Models.Resources;

public class HeaderResource
{
    public Guid? Id { get; set; }
    public string? Token { get; set; }
    public bool IsReadOnly { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public List<ItemResource> Items { get; set; } = [];
    public List<ShareLinkResource> ShareLinks { get; set; } = [];
}
