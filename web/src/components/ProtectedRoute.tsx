import { Navigate } from 'react-router-dom';
import { getAuthState } from '../state/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = getAuthState();
  
  if (!token) {
    console.log('[NAV] No token, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
