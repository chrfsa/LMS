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

        {/* Bouton principal */}
        <Button
          onClick={handleContinue}
          className="w-full text-lg py-3"
        >
          {isCompleted ? '🎉 Voir ma certification' : currentModule?.moduleId === 1 ? '🚀 Commencer le parcours' : `📚 Continuer - Module ${currentModule?.moduleId}`}
        </Button>
      </Card>

      {/* Liste des modules avec leur statut */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-300">Modules du parcours</h3>
        {progress.map((p, index) => {
          const module = MODULES[p.moduleId as 1 | 2 | 3];
          const isCurrent = !isCompleted && p.moduleId === currentModule?.moduleId;
          
          return (
            <Card
              key={p.moduleId}
              className={`transition-all ${
                isCurrent ? 'border-vibeen-accent shadow-lg shadow-vibeen-accent/20' : ''
              } ${!p.unlocked ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                {/* Numéro du module */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    p.validated
                      ? 'bg-green-500/20 text-green-400'
                      : isCurrent
                      ? 'bg-vibeen-accent/20 text-vibeen-accent'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {p.validated ? '✓' : p.moduleId}
                </div>

                {/* Infos du module */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-100 mb-1">
                    {module.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        p.validated
                          ? 'bg-green-500/20 text-green-400'
                          : p.unlocked
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-700 text-gray-500'
                      }`}
                    >
                      {p.validated ? 'Validé' : p.unlocked ? 'En cours' : 'Verrouillé'}
                    </span>
                    {p.quizScore !== null && (
                      <span className="text-xs text-gray-400">
                        Quiz: {p.quizScore}/3
                      </span>
                    )}
                  </div>
                </div>

                {/* Bouton d'accès */}
                {p.unlocked && (
                  <Button
                    variant={isCurrent ? 'primary' : 'secondary'}
                    onClick={() => navigate(`/module/${p.moduleId}`)}
                    className="text-sm"
                  >
                    {p.validated ? 'Revoir' : 'Accéder'}
                  </Button>
                )}
                {!p.unlocked && (
                  <div className="px-4 py-2 rounded-lg bg-gray-800 text-gray-500 text-sm">
                    🔒 Verrouillé
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Message de motivation */}
      {!isCompleted && (
        <Card className="mt-6 bg-vibeen-accent/5 border-vibeen-accent/20">
          <p className="text-center text-gray-300">
            💡 <strong>Astuce:</strong> Valide chaque quiz avec un score de 3/3 pour débloquer le module suivant
          </p>
        </Card>
      )}
    </div>
  );
}
