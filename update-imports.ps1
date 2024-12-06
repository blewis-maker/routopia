# Files to update
$files = @(
    "src/services/activity/ActivityService.ts",
    "src/services/weather/WeatherService.ts",
    "src/services/poi/POIService.ts",
    "src/services/route/RouteService.ts",
    "src/services/realtime/RealTimeService.ts"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Update import paths
    $content = $content -replace "from '\.\./\.\./\.\./types/mcp\.types'", "from '@/types/mcp.types'"
    $content = $content -replace "from '\.\./utils/logger'", "from '@/utils/logger'"
    $content = $content -replace "from '\.\./utils/rateLimiter'", "from '@/utils/rateLimiter'"
    $content = $content -replace "from '\.\./utils/metrics'", "from '@/utils/metrics'"
    $content = $content -replace "from '\.\./utils/cache'", "from '@/utils/cache'"
    $content = $content -replace "from '\./WeatherService'", "from '../weather/WeatherService'"
    $content = $content -replace "from '\./POIService'", "from '../poi/POIService'"
    $content = $content -replace "from '\.\./types/realtime'", "from '@/types/realtime'"
    
    # Save the updated content
    $content | Set-Content $file -NoNewline
    Write-Host "Updated imports in: $file"
}

Write-Host "Import updates completed" 