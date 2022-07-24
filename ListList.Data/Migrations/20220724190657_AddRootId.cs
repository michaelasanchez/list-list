using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listlist.Data.Migrations
{
    public partial class AddRootId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RootId",
                table: "ListItem",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_RootId",
                table: "ListItem",
                column: "RootId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListItem_RootId",
                table: "ListItem",
                column: "RootId",
                principalTable: "ListItem",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListItem_RootId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_RootId",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "RootId",
                table: "ListItem");
        }
    }
}
