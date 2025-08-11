using ListList.Data.Models.Entities;

namespace ListList.Data.Extensions;

public static class NodeExtensions
{
    public static bool HasDescendants(this NodeEntity entity) => entity is not null && entity.Right - entity.Left > 1;
}
