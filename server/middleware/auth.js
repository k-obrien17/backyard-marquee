import jwt from 'jsonwebtoken';
import db from '../db/index.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
export const JWT_SECRET = process.env.JWT_SECRET;

// A valid signature is not enough — the referenced user may have been deleted
// (account closure, guest reaper). Trusting a stale payload causes FK errors
// on the next write. Verify the user still exists before populating req.user.
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const exists = await db.get('SELECT 1 FROM users WHERE id = ?', payload.id);
      if (exists) req.user = payload;
    } catch {}
  }
  next();
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const exists = await db.get('SELECT 1 FROM users WHERE id = ?', payload.id);
    if (!exists) {
      return res.status(401).json({ error: 'Session expired, please sign in again' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
