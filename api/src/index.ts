import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { prisma } from './prisma';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import quizRoutes from './routes/quiz';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/progress', progressRoutes);
app.use('/quiz', quizRoutes);

app.listen(PORT, () => {
  console.log(`[API] listening on :${PORT}`);
});
