import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
// Validation schema
const feedbackSchema = z.object({
    courseRating: z.number().min(1).max(5),
    comment: z.string().optional(),
    moduleRatings: z.record(z.number().min(1).max(5)).optional(),
});
// GET /feedback - Get user's feedback for default course
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('[FEEDBACK] Fetching feedback for user:', req.userId);
        // Get default course
        const course = await prisma.course.findUnique({
            where: { slug: 'cursor' },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const feedback = await prisma.feedback.findUnique({
            where: {
                userId_courseId: {
                    userId: req.userId,
                    courseId: course.id,
                },
            },
        });
        if (!feedback) {
            return res.json(null);
        }
        res.json({
            courseRating: feedback.courseRating,
            comment: feedback.comment,
            moduleRatings: feedback.moduleRatings,
            createdAt: feedback.createdAt,
        });
    }
    catch (error) {
        console.error('[FEEDBACK] Error fetching feedback:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /feedback - Submit or update feedback
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('[FEEDBACK] Submitting feedback for user:', req.userId);
        const { courseRating, comment, moduleRatings } = feedbackSchema.parse(req.body);
        // Get default course
        const course = await prisma.course.findUnique({
            where: { slug: 'cursor' },
        });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        // Check if user has completed the course
        const progress = await prisma.progress.findMany({
            where: {
                userId: req.userId,
                module: { courseId: course.id },
            },
        });
        const allValidated = progress.every(p => p.validated);
        if (!allValidated) {
            return res.status(403).json({ error: 'Course must be completed to submit feedback' });
        }
        // Upsert feedback
        const feedback = await prisma.feedback.upsert({
            where: {
                userId_courseId: {
                    userId: req.userId,
                    courseId: course.id,
                },
            },
            update: {
                courseRating,
                comment,
                moduleRatings,
                updatedAt: new Date(),
            },
            create: {
                userId: req.userId,
                courseId: course.id,
                courseRating,
                comment,
                moduleRatings,
            },
        });
        console.log('[FEEDBACK] Feedback submitted successfully:', feedback.id);
        res.json({
            message: 'Feedback submitted successfully',
            feedback: {
                courseRating: feedback.courseRating,
                comment: feedback.comment,
                moduleRatings: feedback.moduleRatings,
            },
        });
    }
    catch (error) {
        console.error('[FEEDBACK] Error submitting feedback:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
