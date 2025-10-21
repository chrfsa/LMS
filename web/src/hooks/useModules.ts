import { useState, useEffect } from 'react';
import { api } from '../api';

export interface Module {
  id: number;
  order: number;
  title: string;
  youtubeId: string;
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      console.log('[MODULES] Fetching modules');
      const response = await api.get('/modules');
      setModules(response.data);
      console.log('[MODULES] Modules loaded:', response.data);
    } catch (err: any) {
      console.error('[MODULES] Error loading modules:', err);
      setError('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  return { modules, loading, error };
}

export function useModule(moduleId: number) {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadModule();
  }, [moduleId]);

  const loadModule = async () => {
    try {
      console.log('[MODULES] Fetching module:', moduleId);
      const response = await api.get(`/modules/${moduleId}`);
      setModule(response.data);
      console.log('[MODULES] Module loaded:', response.data);
    } catch (err: any) {
      console.error('[MODULES] Error loading module:', err);
      setError('Failed to load module');
    } finally {
      setLoading(false);
    }
  };

  return { module, loading, error };
}

