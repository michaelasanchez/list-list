using ListList.Data.Models;
using ListList.Data.Validators.Interfaces;

namespace ListList.Data.Validators;

public class UserValidator() : IUserValidator
{
    public void UserExists(Guid? userId, ValidationResult result)
    {
        if (userId is null)
        {
            result.AddError("You must be logged in to perform this action.");
        }
    }
}
