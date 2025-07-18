using AutoFixture;
using ListList.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Test.Repositories;

public class BaseRepositoryTest
{
    protected ListListContext _context;

    protected Fixture _fixture = new Fixture();

    public BaseRepositoryTest()
    {
        var builder = new DbContextOptionsBuilder<ListListContext>()
            .UseInMemoryDatabase("ListListTestDatabase");

        _context = new ListListContext(builder.Options);
    }
}
