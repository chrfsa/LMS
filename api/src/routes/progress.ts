import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { quizSubmitSchema } from '../validation';

const router = Router();

// Helper to compute unlocked status
function computeUnlocked(userId: number, progressRecords: any[]) {
  const progressMap = new Map(progressRecords.map(p => [p.moduleId, p]));
  
  return [1, 2, 3].map(moduleId => {
    const record = progressMap.get(moduleId);
    let unlocked = false;
    
    if (moduleId === 1) {
      unlocked = true;
    } else if (moduleId === 2) {
      const prev = progressMap.get(1);
      unlocked = prev?.validated === true;
    } else if (moduleId === 3) {
      const prev = progressMap.get(2);
      unlocked = prev?.validated === true;
    }
    
    return {
      moduleId,
      status: record?.status || 'in_progress',
      validated: record?.validated || false,
      quizScore: record?.quizScore || null,
      unlocked,
    };
  });
}

// GET /progress
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('[PROGRESS] Fetching progress for user:', req.userId);
    
    const progressRecords = await prisma.progress.findMany({
      where: { userId: req.userId },
      orderBy: { moduleId: 'asc' },
    });
    
    const progress = computeUnlocked(req.userId!, progressRecords);
    
    console.log('[PROGRESS] Progress:', progress);
    res.json(progress);
  } catch (error) {
    console.error('[PROGRESS] Error fetching progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /progress/reset
router.post('/reset', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('[PROGRESS] Resetting progress for user:', req.userId);
    
    await prisma.progress.updateMany({
      where: { userId: req.userId },
      data: {
        status: 'in_progress',
        validated: false,
        quizScore: null,
      },
    });
    
    console.log('[PROGRESS] Progress reset successfully');
    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('[PROGRESS] Error resetting progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
