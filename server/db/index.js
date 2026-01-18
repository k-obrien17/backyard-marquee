import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'backyard-marquee.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lineups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lineup_artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineup_id INTEGER NOT NULL,
    slot_position INTEGER NOT NULL,
    artist_name TEXT NOT NULL,
    artist_image TEXT,
    artist_mbid TEXT,
    FOREIGN KEY (lineup_id) REFERENCES lineups(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_lineups_user_id ON lineups(user_id);
  CREATE INDEX IF NOT EXISTS idx_lineup_artists_lineup_id ON lineup_artists(lineup_id);
`);

// Add new columns if they don't exist (migrations)
try {
  db.exec(`ALTER TABLE lineups ADD COLUMN description TEXT`);
} catch (e) {
  // Column already exists
}

try {
  db.exec(`ALTER TABLE lineup_artists ADD COLUMN note TEXT`);
} catch (e) {
  // Column already exists
}

// Migration: Add username column, make email optional
try {
  db.exec(`ALTER TABLE users ADD COLUMN username TEXT`);
} catch (e) {
  // Column already exists
}

// Create unique index on username if it doesn't exist
try {
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
} catch (e) {
  // Index already exists
}

export default db;
