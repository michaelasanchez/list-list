using ListList.Data.Repositories.Interfaces;
using ListList.Data.Validators.Interfaces;

namespace ListList.Data.Models.Interfaces;

public interface IUnitOfWork
{
    IHeaderRepository HeaderRepository { get; }
    IItemRepository ItemRepository { get; }
    IShareRepository ShareRepository { get; }
    IUserRepository UserRepository { get; }

    IItemValidator ItemValidator { get; }

    Task SaveChangesAsync();
}
