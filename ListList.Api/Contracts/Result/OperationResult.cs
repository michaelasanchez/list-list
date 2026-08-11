namespace ListList.Api.Contracts.Result;

public class OperationResult
{
    public Guid? PartitionId { get; set; }
    public Guid? NodeId { get; set; }
    public OperationResultAffected? Affected { get; set; }
}
