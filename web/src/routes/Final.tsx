import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function Final() {
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      console.log('[CERTIFICATE] Requesting certificate download');
      const response = await api.get('/certificate', {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Vibenengineer_Certificate.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('[CERTIFICATE] Certificate downloaded successfully');
    } catch (err) {
      console.error('[CERTIFICATE] Error downloading certificate:', err);
      alert('Erreur lors du téléchargement du certificat');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6">
      <Card className="max-w-2xl w-full text-center space-y-4 sm:space-y-6">
        <div className="text-5xl sm:text-6xl mb-2 sm:mb-4">🎉</div>
        
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-vibeen-accent to-vibeen-purple bg-clip-text text-transparent px-2">
          Félicitations !
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-300 px-2">
          Bravo, tu es maintenant <span className="font-bold text-vibeen-accent">Vibenengineer Certified</span> !
        </p>
        
        <p className="text-sm sm:text-base text-gray-400 px-2">
          Tu as complété les 3 modules avec succès et validé tous les quiz.
          Continue à vibrer avec cette énergie !
        </p>

        <div className="bg-vibeen-accent/10 border border-vibeen-accent/30 rounded-lg p-4 sm:p-6 mx-2">
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            🎓 Télécharge ton certificat officiel Vibeenengineer !
          </p>
          <Button
            onClick={handleDownloadCertificate}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-vibeen-accent to-vibeen-purple hover:opacity-90"
          >
            {downloading ? '📄 Génération en cours...' : '📥 Télécharger mon certificat'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Retour Dashboard
          </Button>
          <Button
            onClick={handleReset}
            disabled={resetting}
            className="w-full sm:w-auto"
          >
            {resetting ? 'Réinitialisation...' : 'Recommencer'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
