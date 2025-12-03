using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IHeaderValidator
{
    Task CanUpdate(Guid? userId, string token, ValidationResult result);
    Task CanView(Guid? userId, string token, ValidationResult result);
    Task IsDeleted(string token, ValidationResult result);
    Task IsNotDeleted(string token, ValidationResult result);
    Task IsOwnedByUser(Guid? userId, string token, ValidationResult result);
    Task IsValidIndex(Guid? userId, int? index, ValidationResult result);
    Task IsValidToken(string token, ValidationResult result);
}
