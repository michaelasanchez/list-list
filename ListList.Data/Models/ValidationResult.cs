namespace ListList.Data.Models;

public class ValidationResult
{
    private List<string> _messages;

    public bool IsInvalid => _messages.Any();

    public string Message => string.Join(" ", _messages);

    public ValidationResult()
    {
        _messages = [];
    }

    public void AddError(string error)
    {
        _messages.Add(error);
    }
}