using AutoFixture;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class RelocateItemTests : BaseItemRepositoryTest
{
    [Fact]
    public async Task ShouldRelocate_SingleItem()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var item1 = await SeedItem(headerId, 1, 2, "Item 1");

        // Act
        await _repository.RelocateListItem(item1.Id, item1.Id, null);

        // Assert
        item1.Left.Should().Be(1);
        item1.Right.Should().Be(2);
    }

    [Fact]
    public async Task ShouldRelocate_RootLevelItem_Downward()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var item1 = await SeedItem(headerId, 1, 2, "Item 1");
        var item2 = await SeedItem(headerId, 3, 4, "Item 2");
        var item3 = await SeedItem(headerId, 5, 6, "Item 3");
        var item4 = await SeedItem(headerId, 7, 8, "Item 4");

        // Act
        await _repository.RelocateListItem(item2.Id, item3.Id, null);

        // Assert
        item1.Left.Should().Be(1);
        item1.Right.Should().Be(2);

        item3.Left.Should().Be(3);
        item3.Right.Should().Be(4);

        item2.Left.Should().Be(5);
        item2.Right.Should().Be(6);

        item4.Left.Should().Be(7);
        item4.Right.Should().Be(8);
    }

    [Fact]
    public async Task ShouldRelocation_RootLevelItem_ToEnd()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var item1 = await SeedItem(headerId, 1, 2, "Item 1");
        var item2 = await SeedItem(headerId, 3, 4, "Item 2");
        var item3 = await SeedItem(headerId, 5, 6, "Item 3");
        var item4 = await SeedItem(headerId, 7, 8, "Item 4");

        // Act
        await _repository.RelocateListItem(item2.Id, item4.Id, null);

        // Assert
        item1.Left.Should().Be(1);
        item1.Right.Should().Be(2);

        item3.Left.Should().Be(3);
        item3.Right.Should().Be(4);

        item4.Left.Should().Be(5);
        item4.Right.Should().Be(6);

        item2.Left.Should().Be(7);
        item2.Right.Should().Be(8);
    }

    [Fact]
    public async Task ShouldRelocate_RootLevelItem_Upward()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var item1 = await SeedItem(headerId, 1, 2, "Item 1");
        var item2 = await SeedItem(headerId, 3, 4, "Item 2");
        var item3 = await SeedItem(headerId, 5, 6, "Item 3");
        var item4 = await SeedItem(headerId, 7, 8, "Item 4");

        // Act
        await _repository.RelocateListItem(item3.Id, item2.Id, null);

        // Assert
        item1.Left.Should().Be(1);
        item1.Right.Should().Be(2);

        item3.Left.Should().Be(3);
        item3.Right.Should().Be(4);

        item2.Left.Should().Be(5);
        item2.Right.Should().Be(6);

        item4.Left.Should().Be(7);
        item4.Right.Should().Be(8);
    }

    [Fact]
    public async Task ShouldRelocation_RootLevelItem_Upward_ToBeginning()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var item1 = await SeedItem(headerId, 1, 2, "Item 1");
        var item2 = await SeedItem(headerId, 3, 4, "Item 2");
        var item3 = await SeedItem(headerId, 5, 6, "Item 3");
        var item4 = await SeedItem(headerId, 7, 8, "Item 4");

        // Act
        await _repository.RelocateListItem(item3.Id, item1.Id, null);

        // Assert
        item3.Left.Should().Be(1);
        item3.Right.Should().Be(2);

        item1.Left.Should().Be(3);
        item1.Right.Should().Be(4);

        item2.Left.Should().Be(5);
        item2.Right.Should().Be(6);

        item4.Left.Should().Be(7);
        item4.Right.Should().Be(8);
    }

    [Theory]

    // Root                             (1, 14)
    // └── Parent1                      (2, 13)
    //     └── Parent2                  (3, 12)
    //         └── Parent3              (4, 11)
    //             └── Parent4          (5, 10)
    //                 └── Parent5      (6, 9)
    //                     └── Child    (7, 8)
    [InlineData(4, 2, 13, 3, 12, 4, 11, 5, 10, 6, 9, 7, 8)]

    // Root
    // └── Parent1
    //     └── Parent2
    //         └── Parent3
    //             └── Parent4          (5, 10)
    //                 ├── Parent5      (6, 7)
    //                 └── Child        (8, 9)
    [InlineData(3, 2, 13, 3, 12, 4, 11, 5, 10, 6, 7, 8, 9)]

    //         └── Parent3              (4, 11)
    //             ├── Parent4          (5, 8)
    //             |   └── Parent5      (6, 7)
    //             └── Child            (9, 10)
    [InlineData(2, 2, 13, 3, 12, 4, 11, 5, 8, 6, 7, 9, 10)]

    //     └── Parent2                  (3, 12)
    //         ├── Parent3              (4, 9)
    //         |   └── Parent4          (5, 8)
    //         |       └── Parent5      (6, 7)
    //         └── Child                (10, 11)
    [InlineData(1, 2, 13, 3, 12, 4, 9, 5, 8, 6, 7, 10, 11)]

    // └── Parent1                      (2, 13)
    //     ├── Parent2                  (3, 10)
    //     |   └── Parent3              (4, 9)
    //     |       └── Parent4          (5, 8)
    //     |           └── Parent5      (6, 7)
    //     └── Child                    (11, 12)
    [InlineData(0, 2, 13, 3, 10, 4, 9, 5, 8, 6, 7, 11, 12)]

    public async Task ShouldUpdateParentWhileKeepingSameItemIndex(
        int index,
        int expectedParent1Left,
        int expectedParent1Right,
        int expectedParent2Left,
        int expectedParent2Right,
        int expectedParent3Left,
        int expectedParent3Right,
        int expectedParent4Left,
        int expectedParent4Right,
        int expectedParent5Left,
        int expectedParent5Right,
        int expectedChildLeft,
        int expectedChildRight)
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var root = await SeedItem(headerId, 1, 14, "root");
        var parent1 = await SeedItem(headerId, 2, 13, "parent1");
        var parent2 = await SeedItem(headerId, 3, 12, "parent2");
        var parent3 = await SeedItem(headerId, 4, 11, "parent3");
        var parent4 = await SeedItem(headerId, 5, 10, "parent4");
        var parent5 = await SeedItem(headerId, 6, 9, "parent5");
        var child = await SeedItem(headerId, 7, 8, "child");

        var parentId = GetIndex(
            [parent1, parent2, parent3, parent4, parent5],
            index);

        // Act
        await _repository.RelocateListItem(child.Id, child.Id, parentId);

        // Assert
        root.Left.Should().Be(1);
        root.Right.Should().Be(14);

        parent1.Left.Should().Be(expectedParent1Left);
        parent1.Right.Should().Be(expectedParent1Right);

        parent2.Left.Should().Be(expectedParent2Left);
        parent2.Right.Should().Be(expectedParent2Right);

        parent3.Left.Should().Be(expectedParent3Left);
        parent3.Right.Should().Be(expectedParent3Right);

        parent4.Left.Should().Be(expectedParent4Left);
        parent4.Right.Should().Be(expectedParent4Right);

        parent5.Left.Should().Be(expectedParent5Left);
        parent5.Right.Should().Be(expectedParent5Right);

        child.Left.Should().Be(expectedChildLeft);
        child.Right.Should().Be(expectedChildRight);
    }

    // Initial                            Intermediate                       Final
    // --------                           -------------                      ------
    // Why                    (1, 22)   R Why                    (1, 20)   R Why                    (1, 22)   
    // ├── One                (2, 3)      ├── One                (2, 3)      ├── One                (2, 3)    
    // ├── Two                (4, 15)   R ├── Two                (4, 13)   R ├── Two                (4, 13)   R
    // │   ├── Inner          (5, 6)      │   ├── Inner          (5, 6)      │   ├── Inner          (5, 6)    
    // │   ├── Boy            (7, 14)   R │   ├── Boy            (7, 12)     │   ├── Boy            (7, 12)   R
    // │   │   ├── Dramatic   (8, 9)      │   │   ├── Dramatic   (8, 9)      │   │   ├── Dramatic   (8, 9)    
    // │   │   ├── much       (10, 11)    │   │   └── much       (10, 11)    │   │   └── much       (10, 11)  
    // │   │   └── yes        (12, 13)  * ├── who                (14, 15)  * ├── yes                (14, 15)  *
    // ├── who                (16, 17)  * ├── arthitis           (16, 17)  * ├── who                (16, 17)  
    // ├── arthitis           (18, 19)  * └── pond               (18, 19)  * ├── arthitis           (18, 19)  
    // └── pond               (20, 21)                                     * └── pond               (20, 21)  

    // OR

    // Initial                            Final
    // --------                           ------
    // Why                    (1, 22)     Why                    (1, 22) 
    // ├── One                (2, 3)      ├── One                (2, 3)  
    // ├── Two                (4, 15)     ├── Two                (4, 13)   R
    // │   ├── Inner          (5, 6)      │   ├── Inner          (5, 6)    
    // │   ├── Boy            (7, 14)     │   ├── Boy            (7, 12)   R
    // │   │   ├── Dramatic   (8, 9)      │   │   ├── Dramatic   (8, 9)    
    // │   │   ├── much       (10, 11)    │   │   └── much       (10, 11)  
    // │   │   └── yes        (12, 13)    ├── yes                (14, 15)  *
    // ├── who                (16, 17)    ├── who                (16, 17)
    // ├── arthitis           (18, 19)    ├── arthitis           (18, 19)
    // └── pond               (20, 21)    └── pond               (20, 21)

    // active   (12, 13)
    // over     (12, 13)
    // parent   (1, 22)

    [Fact]
    public async Task BugScenario_1()
    {
        // Arrange
        var headerId = _fixture.Create<Guid>();

        var Why = await SeedItem(headerId, 1, 22, "Why");
        var One = await SeedItem(headerId, 2, 3, "One");
        var Two = await SeedItem(headerId, 4, 15, "Two");
        var Inner = await SeedItem(headerId, 5, 6, "Inner");
        var Boy = await SeedItem(headerId, 7, 14, "Boy");
        var Dramatic = await SeedItem(headerId, 8, 9, "Dramatic");
        var much = await SeedItem(headerId, 10, 11, "much");
        var yes = await SeedItem(headerId, 12, 13, "yes");
        var who = await SeedItem(headerId, 16, 17, "who");
        var arthitis = await SeedItem(headerId, 18, 19, "arthitis");
        var pond = await SeedItem(headerId, 20, 21, "pond");

        // Act
        await _repository.RelocateListItem(yes.Id, yes.Id, Why.Id);

        // Assert
        Why.Left.Should().Be(1);
        Why.Right.Should().Be(22);

        One.Left.Should().Be(2);
        One.Right.Should().Be(3);

        Two.Left.Should().Be(4);
        Two.Right.Should().Be(13);

        Inner.Left.Should().Be(5);
        Inner.Right.Should().Be(6);

        Boy.Left.Should().Be(7);
        Boy.Right.Should().Be(12);

        Dramatic.Left.Should().Be(8);
        Dramatic.Right.Should().Be(9);

        much.Left.Should().Be(10);
        much.Right.Should().Be(11);

        yes.Left.Should().Be(14);
        yes.Right.Should().Be(15);

        who.Left.Should().Be(16);
        who.Right.Should().Be(17);

        arthitis.Left.Should().Be(18);
        arthitis.Right.Should().Be(19);

        pond.Left.Should().Be(20);
        pond.Right.Should().Be(21);

        var yesCheck = _context.ListItems.SingleOrDefaultAsync(z => z.Id == yes.Id);

        yesCheck.Should().NotBeNull();
    }
}
