using ListList.Data.Models.Enums;

namespace ListList.Api.Contracts;

public class ShareLink
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public SharedPermission Permission { get; set; } = SharedPermission.View;
    public DateTimeOffset? ExpiresOn { get; set; }
    public bool IsActive { get; set; } = true;
}
