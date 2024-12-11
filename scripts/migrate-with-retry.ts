import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMigration(retryCount = 0): Promise<void> {
  try {
    // First try to clear any hanging locks
    await execAsync(`psql "${process.env.DATABASE_URL}" -f scripts/clear_locks.sql`);
    await sleep(2000); // Wait for locks to clear

    // Create the migration
    console.log('Creating migration...');
    await execAsync('npx prisma migrate dev --name update_activity_schema --create-only');
    
    // Apply the migration
    console.log('Applying migration...');
    await execAsync('npx prisma migrate dev');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return runMigration(retryCount + 1);
    } else {
      console.error('Max retries reached. Migration failed.');
      process.exit(1);
    }
  }
}

runMigration(); 