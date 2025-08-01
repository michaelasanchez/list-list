namespace ListList.Api.Contracts;

public class Header
{
    public Guid Id { get; set; }
    public string? Token { get; set; }
    public bool IsReadOnly { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Order { get; set; }
    public List<Item> Items { get; set; } = [];
    public List<ShareLink> ShareLinks { get; set; } = [];
}
