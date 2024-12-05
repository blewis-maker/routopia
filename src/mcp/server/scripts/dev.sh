#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p logs

# Start Redis if not running (assumes Redis is installed)
redis-server --daemonize yes

# Run the server in development mode
npm run dev 