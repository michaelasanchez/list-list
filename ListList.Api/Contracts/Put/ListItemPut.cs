namespace ListList.Api.Contracts.Put
{
    public class ListItemPut
    {
        public Guid Id { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }
    }
}
