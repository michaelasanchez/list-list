using ListList.Data.Validators;
using ListList.Data.Validators.Interfaces;
using ListList.Data.Models.Interfaces;
using ListList.Data.Repositories;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Data.Models
{
    internal class UnitOfWork : IUnitOfWork
    {
        private readonly ListListContext _context;

        private readonly Lazy<IItemRepository> _listItemRepository;
        private readonly Lazy<IHeaderRepository> _listHeaderRepository;
        private readonly Lazy<IUserRepository> _userRepository;

        private readonly Lazy<IItemValidator> _listItemValidator;

        public UnitOfWork(ListListContext context)
        {
            _context = context;

            _listHeaderRepository = new Lazy<IHeaderRepository>(() => new HeaderRepository(_context));
            _listItemRepository = new Lazy<IItemRepository>(() => new ItemRepository(_context));
            _userRepository = new Lazy<IUserRepository>(() => new UserRepository(_context));

            _listItemValidator = new Lazy<IItemValidator>(() => new ItemValidator(_context));
        }

        public IItemRepository ListItemRepository => _listItemRepository.Value;
        public IHeaderRepository ListHeaderRepository => _listHeaderRepository.Value;
        public IUserRepository UserRepository => _userRepository.Value;

        public IItemValidator ListItemValidator => _listItemValidator.Value;

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
}
