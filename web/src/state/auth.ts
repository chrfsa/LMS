import { api } from '../api';
import { User } from '../types';
import { LoginData, RegisterData } from '../utils/validation';

export interface AuthState {
  token: string | null;
  user: User | null;
}

// In-memory state
let authState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
};

// Listeners for state changes
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

export function getAuthState(): AuthState {
  return authState;
}

export async function register(data: RegisterData) {
  console.log('[AUTH] Registering:', data.email);
  const response = await api.post('/auth/register', data);
  authState = {
    token: response.data.token,
    user: response.data.user,
  };
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  notify();
  console.log('[AUTH] Registration successful');
  console.log('[AUTH] 🔑 JWT Token:', response.data.token);
  console.log('[AUTH] 📦 Token stored in localStorage');
  return response.data;
}

export async function login(data: LoginData) {
  console.log('[AUTH] Logging in:', data.email);
  const response = await api.post('/auth/login', data);
  authState = {
    token: response.data.token,
    user: response.data.user,
  };
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  notify();
  console.log('[AUTH] Login successful');
  console.log('[AUTH] 🔑 JWT Token:', response.data.token);
  console.log('[AUTH] 📦 Token stored in localStorage');
  return response.data;
}

export async function me() {
  console.log('[AUTH] Fetching current user');
  const response = await api.get('/auth/me');
  authState.user = response.data;
  localStorage.setItem('user', JSON.stringify(response.data));
  notify();
  return response.data;
}

export function logout() {
  console.log('[AUTH] Logging out');
  authState = { token: null, user: null };
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notify();
}

// Initialize user from localStorage if token exists
if (authState.token) {
  console.log('[AUTH] 🔄 Restoring session from localStorage');
  console.log('[AUTH] 🔑 JWT Token:', authState.token);
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      authState.user = JSON.parse(userStr);
      console.log('[AUTH] ✅ User restored:', authState.user?.email);
    } catch (e) {
      console.error('[AUTH] Failed to parse user from localStorage');
    }
  }
}
