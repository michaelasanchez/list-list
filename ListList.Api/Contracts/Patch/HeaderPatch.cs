namespace ListList.Api.Contracts.Patch;

public class HeaderPatch
{
    public bool? Checklist { get; set; }

    public string? Label { get; set; }
    public string? Description { get; set; }
}
