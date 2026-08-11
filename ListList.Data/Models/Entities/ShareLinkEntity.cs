using ListList.Data.Models.Enums;

namespace ListList.Data.Models.Entities;

public class ShareLinkEntity : BaseEntity
{
    public Guid PartitionId { get; set; }
    public string Token { get; set; } = string.Empty;
    public SharedPermission Permission { get; set; } = SharedPermission.View;
    public DateTimeOffset? ExpiresOn { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual PartitionEntity? Partition { get; set; }
}
