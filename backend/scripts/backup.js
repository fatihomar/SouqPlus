import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const backupDir = path.join(__dirname, '../backups');

// Ensure backups directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }
  return dbUrl;
};

const runBackup = () => {
  const dbUrl = getDatabaseUrl();
  const date = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupFile = path.join(backupDir, `backup-${date}.dump`);

  console.log(`⏳ Starting backup to ${backupFile}...`);

  // Using pg_dump
  const command = `pg_dump "${dbUrl}" -F c -f "${backupFile}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Backup failed. Is pg_dump installed in your PATH?');
      console.error(error.message);
      
      // Fallback message
      console.log('\n💡 If pg_dump is not available on this host:');
      console.log('1. Use your database provider\'s automated backup (e.g., Supabase/AWS/Render Dashboard).');
      console.log('2. Connect externally from a machine that has pg_dump installed.');
      return;
    }
    
    console.log(`✅ Backup completed successfully: ${backupFile}`);
  });
};

runBackup();
