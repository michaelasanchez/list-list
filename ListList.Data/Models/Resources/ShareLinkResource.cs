using ListList.Data.Models.Enums;

namespace ListList.Data.Models.Resources;

public class ShareLinkResource
{
    public Guid? Id { get; set; }
    public string? Token { get; set; }
    public SharedPermission Permission { get; set; }
    public DateTimeOffset? ExpiresOn { get; set; }
    public bool? IsActive { get; set; }
}
