using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IUserValidator
{
    void UserExists(Guid? userId, ValidationResult result);
}
