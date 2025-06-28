namespace ListList.Api.Contracts.Result;

public class OperationResultAffected
{
    public List<Guid> Ids { get; set; } = [];
    public int Left { get; set; }
    public int Right { get; set; }
}
