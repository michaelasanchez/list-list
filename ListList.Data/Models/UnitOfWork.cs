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

    private readonly Lazy<IPartitionRepository> _partitionRepository;
    private readonly Lazy<INodeRepository> _nodeRepository;
    private readonly Lazy<IShareRepository> _shareRepository;
    private readonly Lazy<IUserRepository> _userRepository;

    private readonly Lazy<INodeValidator> _itemValidator;

    public UnitOfWork(ListListContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;

        _partitionRepository = new Lazy<IPartitionRepository>(() => new PartitionRepository(_context, _mapper));
        _nodeRepository = new Lazy<INodeRepository>(() => new NodeRepository(_context, _mapper));
        _shareRepository = new Lazy<IShareRepository>(() => new ShareRepository(_context));
        _userRepository = new Lazy<IUserRepository>(() => new UserRepository(_context));

        _itemValidator = new Lazy<INodeValidator>(() => new NodeValidator(_context));
    }

    public IPartitionRepository PartitionRepository => _partitionRepository.Value;
    public INodeRepository NodeRepository => _nodeRepository.Value;
    public IShareRepository ShareRepository => _shareRepository.Value;
    public IUserRepository UserRepository => _userRepository.Value;

    public INodeValidator NodeValidator => _itemValidator.Value;

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
