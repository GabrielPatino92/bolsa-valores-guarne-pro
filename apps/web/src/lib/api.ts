import axios from 'axios';

/**
 * Cliente HTTP configurado para la API
 * Base URL: http://localhost:3000/api/v1
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar el token JWT a todas las peticiones
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor para manejar errores de autenticación
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ============= TIPOS =============

export interface Provider {
  id: string;
  name: string;
  displayName: string;
  type: 'crypto' | 'stocks' | 'forex' | 'social_trading' | 'charting' | 'multi';
  supportsTestnet: boolean;
}

export interface UserProvider {
  id: string;
  name: string;
  displayName: string;
  isTestnet: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  providers?: UserProvider[];
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  providerIds?: string[];
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// ============= FUNCIONES DE API =============

/**
 * Obtiene todas las plataformas de trading disponibles
 */
export async function getProviders(): Promise<Provider[]> {
  const response = await api.get<Provider[]>('/auth/providers');
  return response.data;
}

/**
 * Registra un nuevo usuario
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
}

/**
 * Inicia sesión
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
}
