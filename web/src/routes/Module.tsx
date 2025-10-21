import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { Progress } from '../types';
import { MODULES } from '../constants';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { Quiz } from '../components/Quiz';
import { Card } from '../components/Card';

export function Module() {
  const { id } = useParams<{ id: string }>();
  const moduleId = parseInt(id || '0');
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      console.log('[PROGRESS] Fetching progress for module access check');
      const response = await api.get('/progress');
      setProgress(response.data);
      
      const moduleProgress = response.data.find((p: Progress) => p.moduleId === moduleId);
      if (!moduleProgress?.unlocked) {
        console.log('[NAV] Module not unlocked, redirecting to dashboard');
        navigate('/');
      }
    } catch (err) {
      console.error('[PROGRESS] Error loading progress:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSuccess = () => {
    console.log('[QUIZ] Quiz validated, refreshing progress');
    loadProgress();
    
    if (moduleId === 3) {
      console.log('[NAV] Module 3 completed, redirecting to final');
      setTimeout(() => navigate('/final'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  const module = MODULES[moduleId as 1 | 2 | 3];
  const moduleProgress = progress.find((p) => p.moduleId === moduleId);

  if (!module || !moduleProgress) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-red-500/10 border-red-500/30">
          <p className="text-red-400">Module introuvable</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/" className="text-vibeen-accent hover:underline text-sm">
          ← Retour au Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              moduleProgress.status === 'done'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {moduleProgress.status === 'done' ? 'Done' : 'En cours'}
          </span>
          {moduleProgress.quizScore !== null && (
            <span className="text-gray-400 text-sm">
              Score: {moduleProgress.quizScore}/3
            </span>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Vidéo</h2>
          <YouTubeEmbed videoId={module.youtubeId} />
        </div>

        <div>
          <Quiz
            moduleId={moduleId}
            isValidated={moduleProgress.validated}
            onSuccess={handleQuizSuccess}
          />
        </div>
      </div>
    </div>
  );
}
