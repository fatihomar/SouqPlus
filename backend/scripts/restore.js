import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const restoreDatabase = () => {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Please provide the backup file path as an argument.');
    console.error('Usage: node restore.js ../backups/backup-file.dump');
    process.exit(1);
  }

  const resolvedPath = path.resolve(__dirname, backupFile);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Backup file not found at: ${resolvedPath}`);
    process.exit(1);
  }

  const testDbUrl = process.env.TEST_DATABASE_URL;
  
  if (!testDbUrl) {
    console.error('❌ TEST_DATABASE_URL is not set in .env.');
    console.error('⚠️ DO NOT restore to your production DATABASE_URL for testing!');
    process.exit(1);
  }

  console.log(`⏳ Starting restore from ${resolvedPath}...`);
  console.log(`⚠️ Restoring to TEST database...`);

  // Using pg_restore to a test db, cleaning it first (-c)
  const command = `pg_restore -c -d "${testDbUrl}" "${resolvedPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Restore failed. Is pg_restore installed in your PATH?');
      console.error(error.message);
      return;
    }
    
    console.log(`✅ Restore completed successfully on the test database!`);
    console.log(`🔍 Verify your data in the test database to ensure integrity.`);
  });
};

restoreDatabase();
