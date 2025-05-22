import { Database } from 'better-sqlite3';
import { migrations } from './migrations.js';

export function runMigrations(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      appliedAt TEXT NOT NULL
    );
  `);

  const applied = db
    .prepare(`SELECT name FROM migrations`)
    .all()
    .map((row: any) => row.name);

  const insertMigration = db.prepare(
    `INSERT INTO migrations (name, appliedAt) VALUES (?, ?)`
  );

  for (const migration of migrations) {
    if (!applied.includes(migration.name)) {
      console.log(`Applying migration: ${migration.name}`);
      db.exec(migration.up);
      insertMigration.run(migration.name, new Date().toISOString());
    }
  }
}
