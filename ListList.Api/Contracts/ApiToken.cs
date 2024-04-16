namespace ListList.Api.Contracts;

public class ApiToken
{
    public string IdToken { get; set; }
    public DateTime Expiry{ get; set; }
    public string RefreshToken { get; set; }
    public string Picture { get; set; }
}
