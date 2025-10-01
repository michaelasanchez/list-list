using ListList.Data.Models;

namespace ListList.Data.Validators.Interfaces;

public interface IShareValidator
{
    Task TokenIsAvailable(Guid? shareLinkid, string token, ValidationResult result);
    Task UserOwnsShareLink(Guid? userId, Guid shareLinkId, ValidationResult result);
}
