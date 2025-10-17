'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

/**
 * Dashboard principal (protegido)
 *
 * Muestra:
 * - Información del usuario
 * - Plataformas conectadas
 * - Estadísticas básicas
 */

function DashboardContent() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Guarne Pro</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-400">Bienvenido</p>
                <p className="text-white font-medium">
                  {user?.fullName || user?.username}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Plataformas Conectadas</span>
              <span className="text-2xl">🔗</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {user?.providers?.length || 0}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Estado</span>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-400">Activo</p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Modo</span>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">Desarrollo</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Información de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Email</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Usuario</p>
              <p className="text-white font-medium">{user?.username}</p>
            </div>
            {user?.fullName && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Nombre Completo</p>
                <p className="text-white font-medium">{user.fullName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-4">
            Plataformas Conectadas
          </h2>

          {user?.providers && user.providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 hover:border-cyan-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">
                      {provider.displayName}
                    </h3>
                    <span className="text-green-400">●</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.isTestnet && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded">
                        Testnet
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                      {provider.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📊</span>
              <p className="text-gray-400 mb-4">
                No tienes plataformas conectadas aún
              </p>
              <p className="text-sm text-gray-500">
                Puedes agregar plataformas en la configuración de tu cuenta
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backtesting Card - ACTIVE */}
          <a
            href="/backtesting"
            className="group bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-8 border border-blue-500/50 hover:border-blue-400 transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📊</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                ACTIVO
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Sistema de Backtesting
            </h3>
            <p className="text-gray-300 mb-4">
              Reproduce datos históricos con control completo. Todas las temporalidades desde ticks hasta 5 años.
            </p>
            <ul className="text-sm text-gray-400 space-y-1 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                40+ temporalidades (ticks a 5 años)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Gráfico TradingView Lightweight Charts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Control de reproducción y velocidad
              </li>
            </ul>
            <div className="flex items-center text-blue-300 group-hover:text-blue-200">
              <span className="font-medium">Ir al Backtesting</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </a>

          {/* Trading en Vivo - Coming Soon */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 opacity-70">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📈</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                PRÓXIMAMENTE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Trading en Vivo
            </h3>
            <p className="text-gray-400 mb-4">
              Opera en tiempo real conectando con Binance, Bybit y otros exchanges.
            </p>
          </div>

          {/* Competencias - Coming Soon */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 opacity-70">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">🏆</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                PRÓXIMAMENTE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Competencias
            </h3>
            <p className="text-gray-400 mb-4">
              Compite con otros traders en torneos y desafíos de trading.
            </p>
          </div>

          {/* Análisis Técnico - Coming Soon */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 opacity-70">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">📉</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                PRÓXIMAMENTE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Análisis Técnico
            </h3>
            <p className="text-gray-400 mb-4">
              Herramientas avanzadas de análisis con indicadores y patrones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
