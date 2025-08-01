using AutoMapper;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories;
using ListList.Data.Repositories.Interfaces;
using ListList.Data.Validators;
using ListList.Data.Validators.Interfaces;

namespace ListList.Data.Models;

internal class UnitOfWork : IUnitOfWork
{
    private readonly ListListContext _context;
    private readonly IMapper _mapper;

    private readonly Lazy<IHeaderRepository> _headerRepository;
    private readonly Lazy<IItemRepository> _itemRepository;
    private readonly Lazy<IShareRepository> _shareRepository;
    private readonly Lazy<IUserRepository> _userRepository;

    private readonly Lazy<IItemValidator> _itemValidator;

    public UnitOfWork(ListListContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;

        _headerRepository = new Lazy<IHeaderRepository>(() => new HeaderRepository(_context, _mapper));
        _itemRepository = new Lazy<IItemRepository>(() => new ItemRepository(_context));
        _shareRepository = new Lazy<IShareRepository>(() => new ShareRepository(_context));
        _userRepository = new Lazy<IUserRepository>(() => new UserRepository(_context));

        _itemValidator = new Lazy<IItemValidator>(() => new ItemValidator(_context));
    }

    public IHeaderRepository HeaderRepository => _headerRepository.Value;
    public IItemRepository ItemRepository => _itemRepository.Value;
    public IShareRepository ShareRepository => _shareRepository.Value;
    public IUserRepository UserRepository => _userRepository.Value;

    public IItemValidator ItemValidator => _itemValidator.Value;

    public async Task SaveChangesAsync()
    {
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("SaveChanges failed", ex);
        }
    }
}
