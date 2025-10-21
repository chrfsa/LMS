import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
// GET /modules - Get all modules for the default course
router.get('/', async (_req, res) => {
    try {
        console.log('[MODULES] Fetching all modules');
        const course = await prisma.course.findUnique({
            where: { slug: 'cursor' },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        order: true,
                        title: true,
                        youtubeId: true,
                    },
                },
            },
        });
        if (!course) {
            return res.status(404).json({ error: 'No course found' });
        }
        res.json(course.modules);
    }
    catch (error) {
        console.error('[MODULES] Error fetching modules:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /modules/:id - Get a specific module
router.get('/:id', async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        console.log('[MODULES] Fetching module:', moduleId);
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            select: {
                id: true,
                order: true,
                title: true,
                youtubeId: true,
            },
        });
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(module);
    }
    catch (error) {
        console.error('[MODULES] Error fetching module:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
