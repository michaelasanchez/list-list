using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    public partial class AddListItemAccomplishableAndDeleted : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Accomplishable",
                table: "ListItem",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CompletedOn",
                table: "ListItem",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Deleted",
                table: "ListItem",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "DeletedOn",
                table: "ListItem",
                type: "datetimeoffset",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Accomplishable",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "CompletedOn",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "Deleted",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "DeletedOn",
                table: "ListItem");
        }
    }
}
