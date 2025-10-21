import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { quizSubmitSchema } from '../validation';

const router = Router();

// Quiz bank with correct answers (server-side only)
const QUIZ_BANK: Record<number, { question: string; options: string[]; answerIndex: number }[]> = {
  1: [
    {
      question: 'Qu\'est-ce que Cursor?',
      options: [
        'Un simple éditeur de texte',
        'Un IDE avec IA intégrée pour le développement',
        'Un terminal avancé',
      ],
      answerIndex: 1,
    },
    {
      question: 'Quel est le principal avantage de Cursor par rapport aux autres IDE?',
      options: [
        'Il est gratuit',
        'Il intègre des modèles d\'IA pour assister le développement',
        'Il consomme moins de RAM',
      ],
      answerIndex: 1,
    },
    {
      question: 'Cursor est basé sur quel éditeur de code?',
      options: [
        'Sublime Text',
        'Visual Studio Code (VS Code)',
        'Atom',
      ],
      answerIndex: 1,
    },
  ],
  2: [
    {
      question: 'Qu\'est-ce qu\'une hallucination d\'un LLM dans Cursor?',
      options: [
        'Un bug visuel dans l\'interface',
        'Quand l\'IA génère du code incorrect ou invente des informations',
        'Un problème de connexion réseau',
      ],
      answerIndex: 1,
    },
    {
      question: 'Comment réduire les hallucinations dans Cursor?',
      options: [
        'Désactiver l\'IA complètement',
        'Fournir un contexte clair et vérifier les suggestions de l\'IA',
        'Utiliser uniquement le mode offline',
      ],
      answerIndex: 1,
    },
    {
      question: 'Que faire si Cursor génère du code erroné?',
      options: [
        'L\'utiliser quand même sans vérifier',
        'Vérifier, corriger et donner un retour pour améliorer le contexte',
        'Redémarrer l\'ordinateur',
      ],
      answerIndex: 1,
    },
  ],
  3: [
    {
      question: 'Que sont les "tools" dans Cursor?',
      options: [
        'Des extensions visuelles uniquement',
        'Des fonctionnalités IA qui peuvent lire/éditer des fichiers et exécuter des commandes',
        'Des raccourcis clavier personnalisés',
      ],
      answerIndex: 1,
    },
    {
      question: 'Quel est l\'avantage des tools dans Cursor?',
      options: [
        'Ils rendent l\'interface plus jolie',
        'Ils permettent à l\'IA d\'interagir avec le projet de manière autonome',
        'Ils accélèrent uniquement la compilation',
      ],
      answerIndex: 1,
    },
    {
      question: 'Que peut faire un tool dans Cursor?',
      options: [
        'Uniquement afficher du texte',
        'Lire des fichiers, exécuter des commandes, modifier du code',
        'Changer uniquement les couleurs du thème',
      ],
      answerIndex: 1,
    },
  ],
};

// Helper to compute if module is unlocked
async function isModuleUnlocked(userId: number, moduleId: number): Promise<boolean> {
  if (moduleId === 1) return true;
  
  const prevModuleId = moduleId - 1;
  const prevProgress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId: prevModuleId } },
  });
  
  return prevProgress?.validated === true;
}

// GET /quiz/:moduleId - Get quiz questions (without answers)
router.get('/:moduleId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    
    if (![1, 2, 3].includes(moduleId)) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    console.log('[QUIZ] Fetching quiz for module:', moduleId);
    
    const quiz = QUIZ_BANK[moduleId];
    const questionsWithoutAnswers = quiz.map(({ answerIndex, ...q }) => q);
    
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
    
    if (![1, 2, 3].includes(moduleId)) {
      return res.status(400).json({ error: 'Invalid module ID' });
    }
    
    console.log('[QUIZ] Submit attempt for module:', moduleId, 'user:', req.userId);
    
    // Check if module is unlocked
    const unlocked = await isModuleUnlocked(req.userId!, moduleId);
    if (!unlocked) {
      console.log('[QUIZ] Module not unlocked:', moduleId);
      return res.status(403).json({ error: 'Module not unlocked' });
    }
    
    // Validate answers
    const { answers } = quizSubmitSchema.parse(req.body);
    
    // Calculate score
    const quiz = QUIZ_BANK[moduleId];
    let score = 0;
    for (let i = 0; i < quiz.length; i++) {
      if (answers[i] === quiz[i].answerIndex) {
        score++;
      }
    }
    
    console.log('[QUIZ] Score:', score, '/', quiz.length);
    
    // Update progress
    const validated = score === quiz.length;
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
      total: quiz.length,
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
