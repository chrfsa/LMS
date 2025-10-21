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
    <header className="bg-vibeen-card border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-vibeen-accent to-vibeen-purple bg-clip-text text-transparent truncate">
          Vibeenengineer LMS
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline text-gray-400 text-sm truncate max-w-[150px]">{authState.user.email}</span>
          <Button variant="secondary" onClick={handleLogout} className="text-xs sm:text-sm px-3 sm:px-4">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
