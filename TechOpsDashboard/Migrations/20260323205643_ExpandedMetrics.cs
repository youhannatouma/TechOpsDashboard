using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechOpsDashboard.Migrations
{
    /// <inheritdoc />
    public partial class ExpandedMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActiveRequests",
                table: "TechMetrics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "DiskReadBytes",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "DiskUsage",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "DiskWriteBytes",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ErrorRate",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "NetworkInBytes",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "NetworkOutBytes",
                table: "TechMetrics",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "ProcessCount",
                table: "TechMetrics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RequestsPerSecond",
                table: "TechMetrics",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ThreadCount",
                table: "TechMetrics",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveRequests",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "DiskReadBytes",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "DiskUsage",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "DiskWriteBytes",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "ErrorRate",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "NetworkInBytes",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "NetworkOutBytes",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "ProcessCount",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "RequestsPerSecond",
                table: "TechMetrics");

            migrationBuilder.DropColumn(
                name: "ThreadCount",
                table: "TechMetrics");
        }
    }
}
