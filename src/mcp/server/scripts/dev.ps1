# Create logs directory if it doesn't exist
New-Item -ItemType Directory -Force -Path logs

# Check if Redis is running
$redis = Get-Process redis-server -ErrorAction SilentlyContinue
if (!$redis) {
    Write-Host "Starting Redis..."
    Start-Process redis-server
}

# Run the server in development mode
npm run dev 