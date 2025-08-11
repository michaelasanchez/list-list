using AutoFixture;
using FluentAssertions;
using ListList.Data.Models.Entities;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class InsertItemTests : BaseItemRepositoryTest
{
    [Theory]
    [InlineData(0, 11, 12, 10, 9, 8, 7)]
    [InlineData(1, 10, 11, 12, 9, 8, 7)]
    [InlineData(2, 9, 10, 12, 11, 8, 7)]
    [InlineData(3, 8, 9, 12, 11, 10, 7)]
    [InlineData(4, 7, 8, 12, 11, 10, 9)]
    public async Task ShouldAdjustAncestorRight(
        int index,
        int expectedActiveLeft,
        int expectedActiveRight,
        int expectedAncestor2Right,
        int expectedAncestor3Right,
        int expectedAncestor4Right,
        int expectedAncestor5Right)
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var root = await SeedItem(headerId, 1, 14);
        var ancestor1 = await SeedItem(headerId, 2, 11);
        var ancestor2 = await SeedItem(headerId, 3, 10);
        var ancestor3 = await SeedItem(headerId, 4, 9);
        var ancestor4 = await SeedItem(headerId, 5, 8);
        var ancestor5 = await SeedItem(headerId, 6, 7);
        var over = await SeedItem(headerId, 12, 13);

        var active = _fixture.Build<NodeEntity>()
            .With(z => z.HeaderId, headerId)
            .With(z => z.Left, 1)
            .With(z => z.Right, 2)
            .Without(x => x.Header)
            .Create();

        var ancestorId = GetIndex(
            [ancestor1, ancestor2, ancestor3, ancestor4, ancestor5],
            index);

        // Act
        await _repository.InsertItem([active], ancestorId, over.Id);

        // Assert
        root.Left.Should().Be(1);
        root.Right.Should().Be(16);

        ancestor1.Left.Should().Be(2);
        ancestor1.Right.Should().Be(13);

        ancestor2.Left.Should().Be(3);
        ancestor2.Right.Should().Be(expectedAncestor2Right);

        ancestor3.Left.Should().Be(4);
        ancestor3.Right.Should().Be(expectedAncestor3Right);

        ancestor4.Left.Should().Be(5);
        ancestor4.Right.Should().Be(expectedAncestor4Right);

        ancestor5.Left.Should().Be(6);
        ancestor5.Right.Should().Be(expectedAncestor5Right);

        active.Left.Should().Be(expectedActiveLeft);
        active.Right.Should().Be(expectedActiveRight);

        over.Left.Should().Be(14);
        over.Right.Should().Be(15);
    }
}
