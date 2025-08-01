using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListList.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddShareLinkAndSharedAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_ListHeaderId",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_User_Id",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_ListItem_Id",
                table: "ListItem");

            migrationBuilder.DropIndex(
                name: "IX_ListHeader_Id",
                table: "ListHeader");

            migrationBuilder.RenameColumn(
                name: "ListHeaderId",
                table: "ListItem",
                newName: "HeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_ListHeaderId",
                table: "ListItem",
                newName: "IX_ListItem_HeaderId");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "ListHeader",
                newName: "OwnerId");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "User",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "ShareLink",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HeaderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Permission = table.Column<int>(type: "int", nullable: false),
                    ExpiresOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Updated = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShareLink", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShareLink_ListHeader_HeaderId",
                        column: x => x.HeaderId,
                        principalTable: "ListHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SharedAccess",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HeaderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GrantedByLinkId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Permission = table.Column<int>(type: "int", nullable: false),
                    Created = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Updated = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedAccess", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedAccess_ListHeader_HeaderId",
                        column: x => x.HeaderId,
                        principalTable: "ListHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedAccess_ShareLink_GrantedByLinkId",
                        column: x => x.GrantedByLinkId,
                        principalTable: "ShareLink",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SharedAccess_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_User_Subject",
                table: "User",
                column: "Subject",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ListHeader_OwnerId",
                table: "ListHeader",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedAccess_GrantedByLinkId",
                table: "SharedAccess",
                column: "GrantedByLinkId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedAccess_HeaderId_UserId",
                table: "SharedAccess",
                columns: new[] { "HeaderId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SharedAccess_UserId",
                table: "SharedAccess",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ShareLink_HeaderId",
                table: "ShareLink",
                column: "HeaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_ListHeader_User_OwnerId",
                table: "ListHeader",
                column: "OwnerId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ListItem_ListHeader_HeaderId",
                table: "ListItem",
                column: "HeaderId",
                principalTable: "ListHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ListHeader_User_OwnerId",
                table: "ListHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_ListItem_ListHeader_HeaderId",
                table: "ListItem");

            migrationBuilder.DropTable(
                name: "SharedAccess");

            migrationBuilder.DropTable(
                name: "ShareLink");

            migrationBuilder.DropIndex(
                name: "IX_User_Subject",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_ListHeader_OwnerId",
                table: "ListHeader");

            migrationBuilder.RenameColumn(
                name: "HeaderId",
                table: "ListItem",
                newName: "ListHeaderId");

            migrationBuilder.RenameIndex(
                name: "IX_ListItem_HeaderId",
                table: "ListItem",
                newName: "IX_ListItem_ListHeaderId");

            migrationBuilder.RenameColumn(
                name: "OwnerId",
                table: "ListHeader",
                newName: "UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "User",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_User_Id",
                table: "User",
                column: "Id");

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
    }
}
