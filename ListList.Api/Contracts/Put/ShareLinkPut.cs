using ListList.Data.Models.Enums;

namespace ListList.Api.Contracts.Put;

public class ShareLinkPut
{
    public string Token { get; set; } = string.Empty;
    public SharedPermission Permission { get; set; } = SharedPermission.View;
    public DateTimeOffset? ExpiresOn { get; set; }
}
