using ListList.Data.Models.Entities;

namespace ListList.Data.Extensions;

public static class NodeExtensions
{
    public static int DescendantCount(this ItemEntity entity) => entity is not null ? (entity.Right - entity.Left - 1) / 2 : 0;
    public static bool IsParent(this ItemEntity entity) => entity is not null && entity.Right - entity.Left > 1;
}
