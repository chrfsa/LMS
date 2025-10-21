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

  // Calculer le nombre total de modules
  const totalModules = progress.length || 3;

  const handleQuizSuccess = () => {
    console.log('[QUIZ] Quiz validated, refreshing progress');
    
    if (moduleId === 3) {
      console.log('[NAV] Module 3 completed, redirecting to final');
      setTimeout(() => navigate('/final'), 2000);
    } else {
      // Passer automatiquement au module suivant
      const nextModuleId = moduleId + 1;
      console.log('[NAV] Navigating to next module:', nextModuleId);
      setTimeout(() => navigate(`/module/${nextModuleId}`), 2000);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-vibeen-accent hover:text-vibeen-accent/80 transition-colors mb-4 text-sm sm:text-base"
        >
          <span className="mr-2">←</span>
          Retour au parcours
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="text-xs sm:text-sm text-gray-400">
            Module {moduleProgress.moduleId} / {totalModules}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {moduleProgress.quizScore !== null && (
              <span className="text-gray-400 text-xs sm:text-sm">
                Score: {moduleProgress.quizScore}/3
              </span>
            )}
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                moduleProgress.status === 'done'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {moduleProgress.status === 'done' ? 'Validé' : 'En cours'}
            </span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-4">{module.title}</h1>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Vidéo</h2>
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
