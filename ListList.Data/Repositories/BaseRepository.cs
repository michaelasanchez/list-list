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

    public async Task<Guid> GetHeaderId(string token)
    {
        var header = Guid.TryParse(token, out var headerId)
            ? _context.Headers
                .Include(z => z.ShareLinks)
                .Where(z =>
                    z.Id == headerId ||
                    z.ShareLinks.Any(y => y.Token == token))
            : _context.Headers
                .Include(z => z.ShareLinks)
                .Where(z =>
                    z.ShareLinks.Any(y => y.Token == token));

        return (await header.SingleAsync()).Id;
    }
}
