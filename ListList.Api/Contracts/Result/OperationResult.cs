namespace ListList.Api.Contracts.Result;

public class OperationResult
{
    public Guid? HeaderId { get; set; }
    public Guid? ItemId { get; set; }
    public OperationResultAffected? Affected { get; set; }
}
