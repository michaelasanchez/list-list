using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    public partial class AddListHeaderRelationship : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderEntityId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_ListHeaderEntityId",
                table: "ListItem");

            migrationBuilder.DropColumn(
                name: "ListHeaderEntityId",
                table: "ListItem");

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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_GroupId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_GroupId",
                table: "ListItem");

            migrationBuilder.AddColumn<Guid>(
                name: "ListHeaderEntityId",
                table: "ListItem",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListItem_ListHeaderEntityId",
                table: "ListItem",
                column: "ListHeaderEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderEntityId",
                table: "ListItem",
                column: "ListHeaderEntityId",
                principalTable: "ListHeader",
                principalColumn: "Id");
        }
    }
}
