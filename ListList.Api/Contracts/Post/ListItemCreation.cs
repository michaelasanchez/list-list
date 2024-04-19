namespace ListList.Api.Contracts.Post;

public class ListItemCreation
{
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Complete { get; set; } = false;
}