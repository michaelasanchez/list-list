using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    public partial class RemoveListItemUserId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_GroupId",
                table: "ListItem");

            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_User_UserId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_GroupId",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "ListItem");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "ListItem",
                newName: "ListHeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_UserId",
                table: "ListItem",
                newName: "IX_ListItem_ListHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_Id",
                table: "ListItem",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ListHeader_Id",
                table: "ListHeader",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderId",
                table: "ListItem",
                column: "ListHeaderId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_Id",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListHeader_Id",
                table: "ListHeader");

            migrationBuilder.RenameColumn(
                name: "ListHeaderId",
                table: "ListItem",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_ListHeaderId",
                table: "ListItem",
                newName: "IX_ListItem_UserId");

            migrationBuilder.AddColumn<Guid>(
                name: "GroupId",
                table: "ListItem",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_GroupId",
                table: "ListItem",
                column: "GroupId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_GroupId",
                table: "ListItem",
                column: "GroupId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_User_UserId",
                table: "ListItem",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
