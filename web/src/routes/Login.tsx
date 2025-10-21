import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../state/auth';
import { loginSchema, registerSchema } from '../utils/validation';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const schema = mode === 'login' ? loginSchema : registerSchema;
      const data = schema.parse({ email, password });

      if (mode === 'login') {
        await login(data);
      } else {
        await register(data);
      }

      console.log('[NAV] Redirecting to dashboard');
      navigate('/');
    } catch (err: any) {
      console.error('[AUTH] Error:', err);
      if (err.name === 'ZodError') {
        setError(err.errors[0].message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-vibeen-accent to-vibeen-purple bg-clip-text text-transparent mb-2">
            Vibeenengineer LMS
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            {mode === 'login' ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              variant={mode === 'login' ? 'primary' : 'secondary'}
              disabled={loading}
              className="flex-1 text-sm sm:text-base"
            >
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'primary' : 'secondary'}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              disabled={loading}
              className="flex-1 text-sm sm:text-base"
            >
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </Button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
          <p>Email: regex simple • Mot de passe: min 5 caractères</p>
        </div>
      </Card>
    </div>
  );
}
