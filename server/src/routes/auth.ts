import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { memDb } from '../db/inMemoryStore.js';
import { validateBody } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'farmmitra_dev_jwt_secret_key_987654321_hackathon';

function generateToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Try primary PostgreSQL db first
    const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        password_hash,
        name,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        created_at: users.created_at,
      });

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser,
    });
  } catch (error) {
    console.warn('[AuthRoute] Postgres registration error, falling back to memory DB:', (error as Error).message);

    // Fallback to in-memory DB when Postgres is not running locally
    if (memDb.findUserByEmail(normalizedEmail)) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const memUser = memDb.createUser(normalizedEmail, password_hash, name);
    const token = generateToken(memUser);

    res.status(201).json({
      message: 'Registration successful (Dev Mode)',
      token,
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        created_at: memUser.created_at,
      },
    });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Try primary PostgreSQL db first
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.warn('[AuthRoute] Postgres login error, falling back to memory DB:', (error as Error).message);

    // Fallback to memory store
    const memUser = memDb.findUserByEmail(normalizedEmail);
    if (!memUser) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, memUser.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ id: memUser.id, email: memUser.email, name: memUser.name });
    res.json({
      message: 'Login successful (Dev Mode)',
      token,
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        created_at: memUser.created_at,
      },
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (user) {
      res.json({ user });
      return;
    }
  } catch (error) {
    console.warn('[AuthRoute] Postgres /me error, checking memory DB:', (error as Error).message);
  }

  // Fallback to memory store
  const memUser = memDb.findUserById(req.user.id);
  if (memUser) {
    res.json({
      user: {
        id: memUser.id,
        email: memUser.email,
        name: memUser.name,
        created_at: memUser.created_at,
      },
    });
    return;
  }

  // If user was created in JWT token but store reset, return token payload
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      created_at: new Date(),
    },
  });
});

export default router;
