using AutoFixture;
using FluentAssertions;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class RelocateItemTests : BaseItemRepositoryTest
{
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
    }
}
