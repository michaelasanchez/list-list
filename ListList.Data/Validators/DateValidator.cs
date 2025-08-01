using ListList.Data.Models;

namespace ListList.Data.Validators;
public static class DateValidator
{
    public static void IsFutureDate(DateTimeOffset? date, ValidationResult result)
    {
        if (date is not null && date < DateTimeOffset.Now)
        {
            result.AddError("Date must be in the future.");
        }
    }
}
