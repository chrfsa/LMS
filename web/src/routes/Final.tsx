import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function Final() {
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      console.log('[PROGRESS] Resetting progress');
      await api.post('/progress/reset');
      console.log('[PROGRESS] Progress reset successful');
      console.log('[NAV] Redirecting to dashboard');
      navigate('/');
    } catch (err) {
      console.error('[PROGRESS] Error resetting progress:', err);
      alert('Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-vibeen-accent to-vibeen-purple bg-clip-text text-transparent">
          Félicitations !
        </h1>
        
        <p className="text-xl text-gray-300">
          Bravo, tu es maintenant <span className="font-bold text-vibeen-accent">Vibenengineer Certified</span> !
        </p>
        
        <p className="text-gray-400">
          Tu as complété les 3 modules avec succès et validé tous les quiz.
          Continue à vibrer avec cette énergie !
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Retour Dashboard
          </Button>
          <Button
            onClick={handleReset}
            disabled={resetting}
          >
            {resetting ? 'Réinitialisation...' : 'Recommencer'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
