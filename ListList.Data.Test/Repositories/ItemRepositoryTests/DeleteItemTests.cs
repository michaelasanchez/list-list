using AutoFixture;
using FluentAssertions;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class DeleteItemTests : BaseItemRepositoryTest
{
    [Theory]
    [InlineData(4, 10, 2, 9, 3, 8, 4, 7, 5, 6, 0, 0)]
    [InlineData(3, 8, 2, 7, 3, 6, 4, 5, 0, 0, 0, 0)]
    [InlineData(2, 6, 2, 5, 3, 4, 0, 0, 0, 0, 0, 0)]
    [InlineData(1, 4, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0)]
    [InlineData(0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)]
    public async Task ShouldRemoveActiveAndDescendants(
        int index,
        int expectedRootRight,
        int descendant1Left,
        int descendant1Right,
        int descendant2Left,
        int descendant2Right,
        int descendant3Left,
        int descendant3Right,
        int descendant4Left,
        int descendant4Right,
        int descendant5Left,
        int descendant5Right)
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var root = await SeedItem(headerId, 1, 12);
        var descendant1 = await SeedItem(headerId, 2, 11);
        var descendant2 = await SeedItem(headerId, 3, 10);
        var descendant3 = await SeedItem(headerId, 4, 9);
        var descendant4 = await SeedItem(headerId, 5, 8);
        var descendant5 = await SeedItem(headerId, 6, 7);

        var id = GetIndex(
            [descendant1, descendant2, descendant3, descendant4, descendant5],
            index);

        // Act
        await _repository.DeleteListItem(id);

        // Assert
        root.Left.Should().Be(1);
        root.Right.Should().Be(expectedRootRight);

        descendant1.Left.Should().Be(descendant1Left);
        descendant1.Right.Should().Be(descendant1Right);

        descendant2.Left.Should().Be(descendant2Left);
        descendant2.Right.Should().Be(descendant2Right);

        descendant3.Left.Should().Be(descendant3Left);
        descendant3.Right.Should().Be(descendant3Right);

        descendant4.Left.Should().Be(descendant4Left);
        descendant4.Right.Should().Be(descendant4Right);

        descendant5.Left.Should().Be(descendant5Left);
        descendant5.Right.Should().Be(descendant5Right);
    }
}