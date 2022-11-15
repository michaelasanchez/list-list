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

        private readonly Lazy<IListItemRepository> _listItemRepository;
        private readonly Lazy<IUserRepository> _userRepository;

        private readonly Lazy<IListItemValidator> _listItemValidator;

        public UnitOfWork(ListListContext context)
        {
            _context = context;

            _listItemRepository = new Lazy<IListItemRepository>(() => new ListItemRepository(_context));
            _userRepository = new Lazy<IUserRepository>(() => new UserRepository(_context));

            _listItemValidator = new Lazy<IListItemValidator>(() => new ListItemValidator(_context));
        }

        public IListItemRepository ListItemRepository => _listItemRepository.Value;
        public IUserRepository UserRepository => _userRepository.Value;

        public IListItemValidator ListItemValidator => _listItemValidator.Value;

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
