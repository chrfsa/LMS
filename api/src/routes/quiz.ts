import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { quizSubmitSchema } from '../validation';

const router = Router();

// Quiz bank with correct answers (server-side only)
const QUIZ_BANK: Record<number, { question: string; options: string[]; answerIndex: number }[]> = {
  1: [
    {
      question: 'Quel est le "signal" principal d\'un bon flux Vibeen?',
      options: [
        'Des écrans remplis d\'options',
        'Une friction minimale et une intention claire',
        'Un design flashy avant tout',
      ],
      answerIndex: 1,
    },
    {
      question: 'Qu\'indique un état "Done" dans ce parcours?',
      options: [
        'La vidéo a été regardée',
        'Le quiz du module est validé',
        'L\'utilisateur est connecté',
      ],
      answerIndex: 1,
    },
    {
      question: 'Quelle métrique suit-on le plus dans un mini-parcours?',
      options: [
        'FPS de l\'animation',
        'Progression déverrouillée par validation',
        'Nombre de composants',
      ],
      answerIndex: 1,
    },
  ],
  2: [
    {
      question: 'Pourquoi découper en sous-tâches et commits fréquents?',
      options: [
        'Pour gonfler le nombre de commits',
        'Pour tester itérativement et isoler les régressions',
        'Pour ignorer les tests',
      ],
      answerIndex: 1,
    },
    {
      question: 'Où doit vivre la vérité de la progression?',
      options: [
        'Dans le state du composant uniquement',
        'Dans la base de données (source de vérité)',
        'Uniquement dans le localStorage',
      ],
      answerIndex: 1,
    },
    {
      question: 'Quel est le meilleur moment pour logger?',
      options: [
        'Uniquement après la prod',
        'À chaque action clé pour tracer le flow',
        'Jamais',
      ],
      answerIndex: 1,
    },
  ],
  3: [
    {
      question: 'Que se passe-t-il après la validation du 3e quiz?',
      options: [
        'Rien',
        'Affichage de l\'écran final de félicitations',
        'Retour automatique au login',
      ],
      answerIndex: 1,
    },
    {
      question: 'Comment empêcher l\'accès prématuré au module 2?',
      options: [
        'En masquant le bouton seulement en CSS',
        'En contrôlant l\'"unlocked" côté serveur et client',
        'En comptant le temps de visionnage',
      ],
      answerIndex: 1,
    },
    {
      question: 'Quelle responsabilité pour l\'API /quiz/:id/submit?',
      options: [
        'Accepter tout score',
        'Calculer le score côté serveur et mettre à jour la progression',
        'Renvoyer les réponses correctes au client',
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
