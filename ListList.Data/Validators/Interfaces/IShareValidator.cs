using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IShareValidator
{
    Task UserOwnsShareLink(Guid? userId, Guid shareLinkId, ValidationResult result);
}
