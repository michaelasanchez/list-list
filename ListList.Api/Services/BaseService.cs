using ListList.Data.Models;
using ListList.Data.Models.Exceptions;

namespace ListList.Api.Services;

public class BaseService
{
    protected async Task InvokeGuard(Func<Task<ValidationResult>> func)
    {
        var result = await func();

        if (result.IsInvalid)
        {
            throw new ValidationException(result.Message);
        }
    }
}
