// Reap guest user rows that own zero lineups.
//
// Why this exists: anonymous lineup creation inserts a `users` row with
// password_hash='guest' and a temporary username. If the user never claims
// the lineup AND the lineup is later deleted (or never persisted to a
// shareable state), that row lingers forever. Repeated abuse of the public
// create endpoint inflates the users table.
//
// Run from server/ with the same .env loaded as the API:
//   node scripts/reap-guest-users.js              # dry run
//   node scripts/reap-guest-users.js --commit     # actually delete

import 'dotenv/config';
import db from '../db/index.js';

const COMMIT = process.argv.includes('--commit');

const orphans = await db.all(`
  SELECT u.id, u.username, u.created_at
  FROM users u
  LEFT JOIN lineups l ON l.user_id = u.id
  WHERE u.password_hash = 'guest'
    AND l.id IS NULL
  ORDER BY u.id
`);

console.log(`Found ${orphans.length} guest user(s) with zero lineups.`);
for (const u of orphans) {
  console.log(`  ${COMMIT ? 'DELETE' : '(dry)'}  id=${u.id}  ${u.username}  created=${u.created_at}`);
}

if (COMMIT && orphans.length > 0) {
  for (const u of orphans) {
    await db.run('DELETE FROM users WHERE id = ?', u.id);
  }
  console.log(`Deleted ${orphans.length} guest user row(s).`);
} else if (!COMMIT && orphans.length > 0) {
  console.log('Dry run. Pass --commit to actually delete.');
}

process.exit(0);
