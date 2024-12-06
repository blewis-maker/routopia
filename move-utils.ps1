# Create utility directories
$directories = @(
    "src/utils/logger",
    "src/utils/rateLimiter",
    "src/utils/metrics",
    "src/utils/cache",
    "src/types/mcp",
    "src/types/realtime"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir"
    }
}

# File moves
$moves = @{
    "src/mcp/server/src/utils/logger.ts" = "src/utils/logger/index.ts"
    "src/mcp/server/src/utils/rateLimiter.ts" = "src/utils/rateLimiter/index.ts"
    "src/mcp/server/src/utils/metrics.ts" = "src/utils/metrics/index.ts"
    "src/mcp/server/src/utils/cache.ts" = "src/utils/cache/index.ts"
    "src/mcp/types/mcp.types.ts" = "src/types/mcp/index.ts"
    "src/mcp/types/realtime.ts" = "src/types/realtime/index.ts"
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
        
        # Copy the file
        Copy-Item -Path $source -Destination $destination -Force
        Write-Host "Copied: $source -> $destination"
    } else {
        Write-Host "Source file not found: $source"
    }
}

Write-Host "File copies completed" 