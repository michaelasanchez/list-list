using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    public partial class AddListHeader : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListItem_RootId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_Id",
                table: "ListItem");

            migrationBuilder.RenameColumn(
                name: "RootId",
                table: "ListItem",
                newName: "ListHeaderEntityId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_RootId",
                table: "ListItem",
                newName: "IX_ListItem_ListHeaderEntityId");

            migrationBuilder.AddColumn<Guid>(
                name: "GroupId",
                table: "ListItem",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ListHeader",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Updated = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListHeader", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderEntityId",
                table: "ListItem",
                column: "ListHeaderEntityId",
                principalTable: "ListHeader",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderEntityId",
                table: "ListItem");

            migrationBuilder.DropTable(
                name: "ListHeader");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "ListItem");

            migrationBuilder.RenameColumn(
                name: "ListHeaderEntityId",
                table: "ListItem",
                newName: "RootId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_ListHeaderEntityId",
                table: "ListItem",
                newName: "IX_ListItem_RootId");

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_Id",
                table: "ListItem",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListItem_RootId",
                table: "ListItem",
                column: "RootId",
                principalTable: "ListItem",
                principalColumn: "Id");
        }
    }
}
