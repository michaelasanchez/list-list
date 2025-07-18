using FluentAssertions;
using ListList.Data.Models.Entities;

namespace ListList.Data.Test.Extensions;

public static class ListItemEntityAsserations
{
    public static void ShouldBe(this ListItemEntity? item, int left, int right)
    {
        item.Left.Should().Be(left);
        item.Right.Should().Be(right);
    }
}
