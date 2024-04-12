using ListList.Data.Validators.Interfaces;
using ListList.Data.Repositories.Interfaces;

namespace ListList.Data.Models.Interfaces;

public interface IUnitOfWork
{
    IHeaderRepository ListHeaderRepository { get; }
    IItemRepository ListItemRepository { get; }
    IUserRepository UserRepository { get; }

    IItemValidator ListItemValidator { get; }

    Task SaveChangesAsync();
}
