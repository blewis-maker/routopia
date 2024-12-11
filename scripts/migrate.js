const { execSync } = require('child_process');

try {
  // Run migration directly with Prisma
  console.log('Running migration...');
  execSync('npx prisma migrate reset --force && npx prisma migrate dev --name update_activity_schema', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLIENT_ENGINE_TYPE: 'binary'
    }
  });

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} 