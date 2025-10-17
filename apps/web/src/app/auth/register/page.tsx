'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, getProviders, Provider } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

/**
 * Página de Registro con selector de plataformas
 *
 * Características:
 * - Formulario completo con validación
 * - Selector visual de plataformas con checkboxes
 * - Agrupación por tipo de plataforma
 * - Indicadores de testnet
 * - Manejo de errores
 */

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    providerIds: [] as string[],
  });

  const [providers, setProviders] = useState<Provider[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Cargar plataformas al montar el componente
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (err) {
      setError('Error al cargar plataformas');
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleProviderToggle = (providerId: string) => {
    setFormData((prev) => ({
      ...prev,
      providerIds: prev.providerIds.includes(providerId)
        ? prev.providerIds.filter((id) => id !== providerId)
        : [...prev.providerIds, providerId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await register(formData);
      setAuth(response.user, response.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al registrar. Verifica que el email y username no estén en uso.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar plataformas por tipo
  const groupedProviders = providers.reduce((acc, provider) => {
    if (!acc[provider.type]) {
      acc[provider.type] = [];
    }
    acc[provider.type].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  // Mapeo de tipos a labels y colores
  const typeInfo: Record<string, { label: string; color: string; emoji: string }> = {
    crypto: { label: 'Criptomonedas', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300', emoji: '₿' },
    stocks: { label: 'Acciones', color: 'bg-blue-500/20 border-blue-500/50 text-blue-300', emoji: '📊' },
    forex: { label: 'Forex', color: 'bg-green-500/20 border-green-500/50 text-green-300', emoji: '💱' },
    social_trading: { label: 'Social Trading', color: 'bg-purple-500/20 border-purple-500/50 text-purple-300', emoji: '👥' },
    charting: { label: 'Gráficos', color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300', emoji: '📈' },
    multi: { label: 'Multi-activos', color: 'bg-pink-500/20 border-pink-500/50 text-pink-300', emoji: '🎯' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Crear Cuenta en Guarne Pro
            </h1>
            <p className="text-gray-400">
              Comienza tu journey en trading consolidado
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid de campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="trader_pro"
                  required
                  disabled={isLoading}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Solo letras, números, guiones y guiones bajos"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Debe incluir mayúscula, minúscula y número
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Juan Pérez"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Selector de Plataformas */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Selecciona tus Plataformas de Trading
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Elige las plataformas que usas o planeas usar. Puedes cambiar esto después.
              </p>

              {loadingProviders ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                  <p className="mt-2 text-gray-400 text-sm">Cargando plataformas...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedProviders).map(([type, typeProviders]) => (
                    <div key={type}>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-3 ${typeInfo[type]?.color || 'bg-gray-500/20'}`}>
                        <span>{typeInfo[type]?.emoji}</span>
                        <span>{typeInfo[type]?.label || type}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {typeProviders.map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleProviderToggle(provider.id)}
                            disabled={isLoading}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              formData.providerIds.includes(provider.id)
                                ? 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/50'
                                : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white mb-1">
                                  {provider.displayName}
                                </div>
                                {provider.supportsTestnet && (
                                  <span className="inline-block text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                                    Testnet
                                  </span>
                                )}
                              </div>
                              <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                formData.providerIds.includes(provider.id)
                                  ? 'bg-cyan-500 border-cyan-500'
                                  : 'border-gray-500'
                              }`}>
                                {formData.providerIds.includes(provider.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loadingProviders}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/auth/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center gap-2"
          >
            <span>←</span> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
