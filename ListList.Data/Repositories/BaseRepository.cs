using AutoMapper;
using ListList.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ListList.Data.Repositories;

public class BaseRepository
{
    protected readonly ListListContext _context;
    protected readonly IMapper _mapper;

    public BaseRepository(ListListContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Guid> GetPartitionId(string token)
    {
        var partition = Guid.TryParse(token, out var partitionId)
            ? _context.Partitions
                .Include(z => z.ShareLinks)
                .Where(z =>
                    z.Id == partitionId ||
                    z.ShareLinks.Any(y => y.Token == token))
            : _context.Partitions
                .Include(z => z.ShareLinks)
                .Where(z =>
                    z.ShareLinks.Any(y => y.Token == token));

        return (await partition.SingleAsync()).Id;
    }
}
