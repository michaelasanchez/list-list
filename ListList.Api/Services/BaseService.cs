using ListList.Data.Models;

namespace ListList.Api.Services;

public class BaseService
{
    protected async Task InvokeGuard(Func<Task<ValidationResult>> func)
    {
        var result = await func();

        if (result.IsInvalid)
        {
            throw new Exception(result.Message);
        }
    }
}
