namespace ListList.Api.Contracts.Post;

public class HeaderCreation
{
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public int? Order { get; set; }
}
