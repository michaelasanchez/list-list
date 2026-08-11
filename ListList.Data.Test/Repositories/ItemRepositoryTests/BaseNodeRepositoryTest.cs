using AutoFixture;
using AutoMapper;
using ListList.Data.Models.Entities;
using ListList.Data.Repositories;
using Moq;

namespace ListList.Data.Test.Repositories.ItemRepositoryTests;

public class BaseNodeRepositoryTest : BaseRepositoryTest
{
    protected NodeRepository _repository;

    public BaseNodeRepositoryTest() : base()
    {
        var mockMapper = new Mock<IMapper>();

        _repository = new NodeRepository(_context, mockMapper.Object);
    }

    protected Guid GetIndex(List<NodeEntity> nodes, int index) => nodes[index].Id;

    protected async Task<NodeEntity> SeedNode(
        Guid partitionId,
        int left,
        int right,
        string? label = null)
    {
        label ??= _fixture.Create<string>();

        var node = _fixture.Build<NodeEntity>()
            .With(z => z.PartitionId, partitionId)
            .With(z => z.Left, left)
            .With(z => z.Right, right)
            .With(z => z.Label, label)
            .With(z => z.Deleted, false)
            .Without(x => x.Partition)
            .Create();

        await _context.Nodes.AddAsync(node);
        await _context.SaveChangesAsync();

        return node;
    }
}
