import { logout, getAuthState, subscribe } from '../state/auth';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(getAuthState());

  useEffect(() => {
    return subscribe(() => {
      setAuthState(getAuthState());
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!authState.user) return null;

  return (
    <header className="bg-vibeen-card border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-vibeen-accent to-vibeen-purple bg-clip-text text-transparent">
          Vibeenengineer LMS
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{authState.user.email}</span>
          <Button variant="secondary" onClick={handleLogout} className="text-sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
