using ListList.Api.Guards.Interfaces;
using ListList.Data.Validators.Interfaces;

namespace ListList.Api.Guards;

public partial class Guard(
    IPartitionValidator partitionValidator,
    INodeValidator nodeValidator,
    IShareValidator shareValidator) : IGuard
{
}
