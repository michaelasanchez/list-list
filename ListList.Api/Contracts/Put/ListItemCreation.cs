﻿namespace ListList.Api.Contracts.Put;

public class ListItemCreation
{
    public string Label { get; set; }
    public string Description { get; set; }
    public bool Complete { get; set; }
}