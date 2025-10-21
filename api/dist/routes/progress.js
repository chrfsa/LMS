import { Router } from 'express';
import { prisma } from '../prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
// Helper to compute unlocked status based on module order
function computeUnlocked(modules, progressRecords) {
    const progressMap = new Map(progressRecords.map(p => [p.moduleId, p]));
    // Sort modules by order
    const sortedModules = modules.sort((a, b) => a.order - b.order);
    return sortedModules.map((module, index) => {
        const record = progressMap.get(module.id);
        let unlocked = false;
        // First module is always unlocked
        if (index === 0) {
            unlocked = true;
        }
        else {
            // Check if previous module is validated
            const prevModule = sortedModules[index - 1];
            const prevRecord = progressMap.get(prevModule.id);
            unlocked = prevRecord?.validated === true;
        }
        return {
            moduleId: module.id,
            status: record?.status || 'in_progress',
            validated: record?.validated || false,
            quizScore: record?.quizScore || null,
            unlocked,
        };
    });
}
// GET /progress
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('[PROGRESS] Fetching progress for user:', req.userId);
        // Get default course modules
        const defaultCourse = await prisma.course.findUnique({
            where: { slug: 'cursor' },
            include: { modules: true },
        });
        if (!defaultCourse) {
            return res.status(404).json({ error: 'No course found' });
        }
        const progressRecords = await prisma.progress.findMany({
            where: { userId: req.userId },
            orderBy: { moduleId: 'asc' },
        });
        const progress = computeUnlocked(defaultCourse.modules, progressRecords);
        console.log('[PROGRESS] Progress:', progress);
        res.json(progress);
    }
    catch (error) {
        console.error('[PROGRESS] Error fetching progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /progress/reset
router.post('/reset', authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('[PROGRESS] Error resetting progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
