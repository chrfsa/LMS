import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Progress } from '../types';
import { MODULES } from '../constants';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressLock } from '../components/ProgressLock';

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Votre parcours Vibeenengineer</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {progress.map((p) => {
          const module = MODULES[p.moduleId as 1 | 2 | 3];
          return (
            <Card key={p.moduleId} className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">
                  {module.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'done'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {p.status === 'done' ? 'Done' : 'En cours'}
                </span>
              </div>

              {p.quizScore !== null && (
                <p className="text-sm text-gray-400 mb-4">
                  Score: {p.quizScore}/3
                </p>
              )}

              <div className="mt-auto">
                <Button
                  onClick={() => navigate(`/module/${p.moduleId}`)}
                  disabled={!p.unlocked}
                  className="w-full"
                >
                  Accéder
                </Button>
                {!p.unlocked && <ProgressLock />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
