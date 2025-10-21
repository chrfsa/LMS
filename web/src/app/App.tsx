import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../routes/Login';
import { Dashboard } from '../routes/Dashboard';
import { Module } from '../routes/Module';
import { Final } from '../routes/Final';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Header } from '../components/Header';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-vibeen-dark">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/module/:id"
            element={
              <ProtectedRoute>
                <Module />
              </ProtectedRoute>
            }
          />
          <Route
            path="/final"
            element={
              <ProtectedRoute>
                <Final />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
