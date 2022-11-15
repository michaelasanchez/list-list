using ListList.Data.Validators.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Data.Models.Interfaces
{
    public interface IUnitOfWork
    {
        IListItemRepository ListItemRepository { get; }
        IUserRepository UserRepository { get; }

        IListItemValidator ListItemValidator { get; }

        Task SaveChangesAsync();
    }
}
