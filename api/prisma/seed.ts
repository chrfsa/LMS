import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting database seeding...');

  // Nettoyer les données existantes
  await prisma.progress.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();

  console.log('[SEED] Cleaned existing data');

  // Créer le parcours Cursor
  const cursorCourse = await prisma.course.create({
    data: {
      name: 'Parcours Cursor',
      description: 'Maîtrisez Cursor, l\'IDE propulsé par l\'IA',
      slug: 'cursor',
    },
  });

  console.log('[SEED] Created course:', cursorCourse.name);

  // Module 1: Introduction à Cursor
  const module1 = await prisma.module.create({
    data: {
      courseId: cursorCourse.id,
      order: 1,
      title: 'Module 1 — Introduction à Cursor',
      youtubeId: 'IccjZDV93lw',
      questions: {
        create: [
          {
            order: 1,
            text: 'Qu\'est-ce que Cursor?',
            options: {
              create: [
                { order: 1, text: 'Un simple éditeur de texte', isCorrect: false },
                { order: 2, text: 'Un IDE avec IA intégrée pour le développement', isCorrect: true },
                { order: 3, text: 'Un terminal avancé', isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            text: 'Quel est le principal avantage de Cursor par rapport aux autres IDE?',
            options: {
              create: [
                { order: 1, text: 'Il est gratuit', isCorrect: false },
                { order: 2, text: 'Il intègre des modèles d\'IA pour assister le développement', isCorrect: true },
                { order: 3, text: 'Il consomme moins de RAM', isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            text: 'Cursor est basé sur quel éditeur de code?',
            options: {
              create: [
                { order: 1, text: 'Sublime Text', isCorrect: false },
                { order: 2, text: 'Visual Studio Code (VS Code)', isCorrect: true },
                { order: 3, text: 'Atom', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('[SEED] Created module:', module1.title);

  // Module 2: Hallucinations des LLM
  const module2 = await prisma.module.create({
    data: {
      courseId: cursorCourse.id,
      order: 2,
      title: 'Module 2 — Hallucinations des LLM dans Cursor',
      youtubeId: 'IccjZDV93lw',
      questions: {
        create: [
          {
            order: 1,
            text: 'Qu\'est-ce qu\'une hallucination d\'un LLM dans Cursor?',
            options: {
              create: [
                { order: 1, text: 'Un bug visuel dans l\'interface', isCorrect: false },
                { order: 2, text: 'Quand l\'IA génère du code incorrect ou invente des informations', isCorrect: true },
                { order: 3, text: 'Un problème de connexion réseau', isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            text: 'Comment réduire les hallucinations dans Cursor?',
            options: {
              create: [
                { order: 1, text: 'Désactiver l\'IA complètement', isCorrect: false },
                { order: 2, text: 'Fournir un contexte clair et vérifier les suggestions de l\'IA', isCorrect: true },
                { order: 3, text: 'Utiliser uniquement le mode offline', isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            text: 'Que faire si Cursor génère du code erroné?',
            options: {
              create: [
                { order: 1, text: 'L\'utiliser quand même sans vérifier', isCorrect: false },
                { order: 2, text: 'Vérifier, corriger et donner un retour pour améliorer le contexte', isCorrect: true },
                { order: 3, text: 'Redémarrer l\'ordinateur', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('[SEED] Created module:', module2.title);

  // Module 3: Les Tools
  const module3 = await prisma.module.create({
    data: {
      courseId: cursorCourse.id,
      order: 3,
      title: 'Module 3 — Les Tools dans Cursor',
      youtubeId: 'byR5YVesMeg',
      questions: {
        create: [
          {
            order: 1,
            text: 'Que sont les "tools" dans Cursor?',
            options: {
              create: [
                { order: 1, text: 'Des extensions visuelles uniquement', isCorrect: false },
                { order: 2, text: 'Des fonctionnalités IA qui peuvent lire/éditer des fichiers et exécuter des commandes', isCorrect: true },
                { order: 3, text: 'Des raccourcis clavier personnalisés', isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            text: 'Quel est l\'avantage des tools dans Cursor?',
            options: {
              create: [
                { order: 1, text: 'Ils rendent l\'interface plus jolie', isCorrect: false },
                { order: 2, text: 'Ils permettent à l\'IA d\'interagir avec le projet de manière autonome', isCorrect: true },
                { order: 3, text: 'Ils accélèrent uniquement la compilation', isCorrect: false },
              ],
            },
          },
          {
            order: 3,
            text: 'Que peut faire un tool dans Cursor?',
            options: {
              create: [
                { order: 1, text: 'Uniquement afficher du texte', isCorrect: false },
                { order: 2, text: 'Lire des fichiers, exécuter des commandes, modifier du code', isCorrect: true },
                { order: 3, text: 'Changer uniquement les couleurs du thème', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('[SEED] Created module:', module3.title);

  console.log('[SEED] ✅ Database seeding completed!');
  console.log('[SEED] Course:', cursorCourse.name);
  console.log('[SEED] Modules: 3');
  console.log('[SEED] Questions: 9');
  console.log('[SEED] Options: 27');
}

main()
  .catch((e) => {
    console.error('[SEED] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

