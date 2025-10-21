import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Progress } from '../types';
import { MODULES } from '../constants';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export function Dashboard() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      console.log('[PROGRESS] Fetching progress');
      const response = await api.get('/progress');
      setProgress(response.data);
      console.log('[PROGRESS] Progress loaded:', response.data);
    } catch (err: any) {
      console.error('[PROGRESS] Error loading progress:', err);
      setError('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Calculer la progression globale
  const completedModules = progress.filter(p => p.validated).length;
  const totalModules = progress.length;
  const progressPercentage = (completedModules / totalModules) * 100;

  // Trouver le module actuel (premier non validé)
  const currentModule = progress.find(p => !p.validated);
  const isCompleted = completedModules === totalModules;

  const handleContinue = () => {
    if (isCompleted) {
      navigate('/final');
    } else if (currentModule) {
      navigate(`/module/${currentModule.moduleId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mon Parcours</h1>
        <p className="text-sm sm:text-base text-gray-400">Parcours Vibeenengineer — De débutant à certifié</p>
      </div>

      {/* Card principale du parcours */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Parcours Vibeenengineer
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              {isCompleted ? 'Parcours terminé !' : `Module ${currentModule?.moduleId} / ${totalModules} en cours`}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-vibeen-accent">
              {completedModules}/{totalModules}
            </div>
            <div className="text-xs text-gray-400">modules validés</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-2">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-vibeen-accent to-vibeen-purple transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Description du parcours */}
        <div className="mb-6 p-3 sm:p-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            🎓 <strong>À propos de ce parcours :</strong><br/>
            Découvrez les fondamentaux du Vibeenengineering à travers {totalModules} modules progressifs. 
            Chaque module contient une vidéo et un quiz de validation. 
            {!isCompleted && ' Validez chaque quiz pour débloquer le module suivant.'}
          </p>
        </div>

        {/* Bouton principal */}
        <Button
          onClick={handleContinue}
          className="w-full text-base sm:text-lg py-2.5 sm:py-3"
        >
          {isCompleted ? '🎉 Voir ma certification' : currentModule?.moduleId === 1 ? '🚀 Commencer le parcours' : `📚 Continuer - Module ${currentModule?.moduleId}`}
        </Button>
      </Card>
    </div>
  );
}
