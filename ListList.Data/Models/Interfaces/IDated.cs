namespace ListList.Data.Models.Interfaces
{
    public interface IDated
    {
        DateTimeOffset Created { get; set; }
        DateTimeOffset? Updated { get; set; }
    }
}
