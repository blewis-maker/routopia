import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runMigration() {
  try {
    // First, try to release any hanging locks
    await execAsync('npx prisma migrate reset --force');
    
    // Then run the migration
    await execAsync('npx prisma migrate dev --name update_activity_schema_and_relations');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 