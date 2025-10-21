import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { registerSchema, loginSchema } from '../validation';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    console.log('[AUTH] Register attempt:', req.body.email);
    
    const { email, password } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('[AUTH] User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    
    console.log('[DB] User created:', user.id);
    
    // Initialize progress for all modules in the default course (slug: 'cursor')
    const defaultCourse = await prisma.course.findUnique({
      where: { slug: 'cursor' },
      include: { modules: true },
    });
    
    if (defaultCourse && defaultCourse.modules.length > 0) {
      await prisma.progress.createMany({
        data: defaultCourse.modules.map(module => ({
          userId: user.id,
          moduleId: module.id,
          status: 'in_progress' as const,
          validated: false,
        })),
      });
      console.log('[PROGRESS] Initialized progress for', defaultCourse.modules.length, 'modules');
    }
    
    console.log('[PROGRESS] Progress initialized for user:', user.id);
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('[AUTH] User registered successfully:', email);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error('[AUTH] Registration error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('[AUTH] Login attempt:', req.body.email);
    
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('[AUTH] Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('[AUTH] User logged in successfully:', email);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error('[AUTH] Login error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('[AUTH] /me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
