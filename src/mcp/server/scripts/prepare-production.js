const fs = require('fs');
const path = require('path');

// Paths
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const configDir = path.join(distDir, 'config');

// Ensure directories exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

// Copy production configuration files
const configFiles = [
  '.env.production',
  'ecosystem.config.js'
];

configFiles.forEach(file => {
  const sourcePath = path.join(rootDir, file);
  const destPath = path.join(configDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/config`);
  }
});

// Create production ecosystem file if it doesn't exist
const ecosystemPath = path.join(configDir, 'ecosystem.config.js');
if (!fs.existsSync(ecosystemPath)) {
  const ecosystemConfig = `module.exports = {
  apps: [{
    name: 'mcp-server',
    script: '../index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};`;

  fs.writeFileSync(ecosystemPath, ecosystemConfig);
  console.log('Created ecosystem.config.js');
}

// Create production environment file if it doesn't exist
const envPath = path.join(configDir, '.env.production');
if (!fs.existsSync(envPath)) {
  const envConfig = `NODE_ENV=production
PORT=3000
CLAUDE_API_KEY=
REDIS_HOST=localhost
REDIS_PORT=6379
METRICS_ENABLED=true
METRICS_INTERVAL=60000
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
CACHE_TTL=3600
LOG_LEVEL=info`;

  fs.writeFileSync(envPath, envConfig);
  console.log('Created .env.production');
}

// Create production Dockerfile
const dockerfilePath = path.join(rootDir, 'Dockerfile');
if (!fs.existsSync(dockerfilePath)) {
  const dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY config/ ./config/

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]`;

  fs.writeFileSync(dockerfilePath, dockerfile);
  console.log('Created Dockerfile');
}

console.log('Production preparation complete!'); 