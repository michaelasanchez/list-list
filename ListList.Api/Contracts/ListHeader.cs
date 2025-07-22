namespace ListList.Api.Contracts;

public class ListHeader
{
    public Guid Id { get; set; }
    public string Label { get; set; }
    public string Description { get; set; }
    public int Order { get; set; }
    public List<ListItem> Items { get; set; }
}
