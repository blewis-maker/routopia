# Create necessary directories
$directories = @(
    "src/app/test",
    "src/components/visualization",
    "src/services/activity",
    "src/services/weather",
    "src/services/poi",
    "src/hooks",
    "src/utils/logger"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir"
    }
}

# File moves
$moves = @{
    "src/mcp/server/src/services/ActivityService.ts" = "src/services/activity/ActivityService.ts"
    "src/mcp/server/src/services/WeatherService.ts" = "src/services/weather/WeatherService.ts"
    "src/mcp/server/src/services/POIService.ts" = "src/services/poi/POIService.ts"
    "src/mcp/server/src/services/RouteService.ts" = "src/services/route/RouteService.ts"
    "src/mcp/server/src/services/RealTimeService.ts" = "src/services/realtime/RealTimeService.ts"
}

foreach ($source in $moves.Keys) {
    $destination = $moves[$source]
    if (Test-Path $source) {
        # Create the destination directory if it doesn't exist
        $destDir = Split-Path -Parent $destination
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force
            Write-Host "Created directory: $destDir"
        }
        
        # Copy the file instead of moving to preserve the original
        Copy-Item -Path $source -Destination $destination -Force
        Write-Host "Copied: $source -> $destination"
    } else {
        Write-Host "Source file not found: $source"
    }
}

Write-Host "File copies completed"

# Clean up empty directories in MCP
$emptyDirs = @(
    "src/mcp/pages",
    "src/mcp/schemas/visualization",
    "src/mcp/services",
    "src/mcp/utils",
    "src/mcp/hooks"
)

foreach ($dir in $emptyDirs) {
    if ((Test-Path $dir) -and ((Get-ChildItem $dir -Recurse | Measure-Object).Count -eq 0)) {
        Remove-Item $dir -Recurse -Force
        Write-Host "Removed empty directory: $dir"
    }
} 