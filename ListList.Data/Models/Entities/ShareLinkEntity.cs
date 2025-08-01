using ListList.Data.Models.Enums;

namespace ListList.Data.Models.Entities;

public class ShareLinkEntity : BaseEntity
{
    public Guid HeaderId { get; set; }
    public string Token { get; set; } = string.Empty;
    public SharedPermission Permission { get; set; } = SharedPermission.View;
    public DateTimeOffset? ExpiresOn { get; set; }
    public bool IsActive { get; set; } = true;

}
