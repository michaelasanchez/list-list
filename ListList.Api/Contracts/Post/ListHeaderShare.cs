using ListList.Data.Models.Enums;

namespace ListList.Api.Contracts.Post;

public class ListHeaderShare
{
    public string? Token { get; set; }
    public SharedPermission Permission { get; set; } = SharedPermission.View;
    public DateTimeOffset? ExpiresOn { get; set; }
}
