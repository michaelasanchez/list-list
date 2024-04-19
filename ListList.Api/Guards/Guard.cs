using ListList.Api.Guards.Interfaces;
using ListList.Data.Validators.Interfaces;

namespace ListList.Api.Guards;

public partial class Guard(IHeaderValidator _headerValidator, IItemValidator _itemValidator) : IGuard
{
}
