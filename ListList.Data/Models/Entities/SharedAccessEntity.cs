using ListList.Data.Models.Enums;

namespace ListList.Data.Models.Entities;

public class SharedAccessEntity : BaseEntity
{
    public Guid HeaderId { get; set; }
    public Guid UserId { get; set; }
    public Guid? GrantedByLinkId { get; set; }
    public SharedPermission Permission { get; set; } = SharedPermission.View;

}
