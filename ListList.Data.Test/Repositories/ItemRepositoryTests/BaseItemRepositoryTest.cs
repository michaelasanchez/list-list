using AutoFixture;
using ListList.Data.Models.Entities;
using ListList.Data.Repositories;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class BaseItemRepositoryTest : BaseRepositoryTest
{
    protected ItemRepository _repository;

    public BaseItemRepositoryTest() : base()
    {
        _repository = new ItemRepository(_context);
    }

    protected Guid GetIndex(List<ListItemEntity> items, int index) => items[index].Id;

    protected async Task<ListItemEntity> SeedItem(
        Guid listHeaderId,
        int left,
        int right,
        string? label = null)
    {
        label ??= _fixture.Create<string>();

        var item = _fixture.Build<ListItemEntity>()
            .With(z => z.ListHeaderId, listHeaderId)
            .With(z => z.Left, left)
            .With(z => z.Right, right)
            .With(z => z.Label, label)
            .With(z => z.Deleted, false)
            .Without(x => x.ListHeader)
            .Create();

        await _context.ListItems.AddAsync(item);
        await _context.SaveChangesAsync();

        return item;
    }
}
