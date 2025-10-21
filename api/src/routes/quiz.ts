import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { quizSubmitSchema } from '../validation';

const router = Router();

// Helper to compute if module is unlocked based on order
async function isModuleUnlocked(userId: number, moduleId: number): Promise<boolean> {
  // Get the module with its course info
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { include: { modules: { orderBy: { order: 'asc' } } } } },
  });
  
  if (!module) return false;
  
  // Find the module's position in the course
  const moduleIndex = module.course.modules.findIndex(m => m.id === moduleId);
  
  // First module is always unlocked
  if (moduleIndex === 0) return true;
  
  // Check if previous module is validated
  const prevModule = module.course.modules[moduleIndex - 1];
  const prevProgress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId: prevModule.id } },
  });
  
  return prevProgress?.validated === true;
}

// GET /quiz/:moduleId - Get quiz questions (without correct answers)
router.get('/:moduleId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    
    console.log('[QUIZ] Fetching quiz for module:', moduleId);
    
    // Get questions with options from DB
    const questions = await prisma.question.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No quiz found for this module' });
    }
    
    // Format response without revealing correct answers
    const questionsWithoutAnswers = questions.map(q => ({
      question: q.text,
      options: q.options.map(opt => opt.text),
    }));
    
    res.json(questionsWithoutAnswers);
  } catch (error) {
    console.error('[QUIZ] Error fetching quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /quiz/:moduleId/submit - Submit quiz answers
router.post('/:moduleId/submit', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    
    console.log('[QUIZ] Submit attempt for module:', moduleId, 'user:', req.userId);
    
    // Check if module is unlocked
    const unlocked = await isModuleUnlocked(req.userId!, moduleId);
    if (!unlocked) {
      console.log('[QUIZ] Module not unlocked:', moduleId);
      return res.status(403).json({ error: 'Module not unlocked' });
    }
    
    // Validate answers
    const { answers } = quizSubmitSchema.parse(req.body);
    
    // Get questions with correct answers from DB
    const questions = await prisma.question.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No quiz found for this module' });
    }
    
    // Calculate score by comparing answers
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      const correctOptionIndex = questions[i].options.findIndex(opt => opt.isCorrect);
      if (answers[i] === correctOptionIndex) {
        score++;
      }
    }
    
    console.log('[QUIZ] Score:', score, '/', questions.length);
    
    // Update progress
    const validated = score === questions.length;
    const status = validated ? 'done' : 'in_progress';
    
    await prisma.progress.update({
      where: { userId_moduleId: { userId: req.userId!, moduleId } },
      data: {
        status,
        validated,
        quizScore: score,
      },
    });
    
    console.log('[QUIZ] Progress updated:', { moduleId, status, validated, score });
    
    res.json({
      score,
      validated,
      total: questions.length,
    });
  } catch (error: any) {
    console.error('[QUIZ] Error submitting quiz:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
