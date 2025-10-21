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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon Parcours</h1>
        <p className="text-gray-400">Parcours Vibeenengineer — De débutant à certifié</p>
      </div>

      {/* Card principale du parcours */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Parcours Vibeenengineer
            </h2>
            <p className="text-gray-400">
              {isCompleted ? 'Parcours terminé !' : `Module ${currentModule?.moduleId} / ${totalModules} en cours`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-vibeen-accent">
              {completedModules}/{totalModules}
            </div>
            <div className="text-xs text-gray-400">modules validés</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-vibeen-accent to-vibeen-purple transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Description du parcours */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-sm leading-relaxed">
            🎓 <strong>À propos de ce parcours :</strong><br/>
            Découvrez les fondamentaux du Vibeenengineering à travers {totalModules} modules progressifs. 
            Chaque module contient une vidéo et un quiz de validation. 
            {!isCompleted && ' Validez chaque quiz pour débloquer le module suivant.'}
          </p>
        </div>

        {/* Bouton principal */}
        <Button
          onClick={handleContinue}
          className="w-full text-lg py-3"
        >
          {isCompleted ? '🎉 Voir ma certification' : currentModule?.moduleId === 1 ? '🚀 Commencer le parcours' : `📚 Continuer - Module ${currentModule?.moduleId}`}
        </Button>
      </Card>
    </div>
  );
}
