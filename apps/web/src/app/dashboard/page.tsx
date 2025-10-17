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

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-xl p-8 border border-cyan-500/30">
          <div className="text-center">
            <span className="text-5xl mb-4 block">🚀</span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Próximamente
            </h3>
            <p className="text-gray-300 mb-4">
              Estamos trabajando en nuevas funcionalidades
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-gray-800/50 rounded-lg text-cyan-300 text-sm">
                Trading en Vivo
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-lg text-cyan-300 text-sm">
                Backtesting
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-lg text-cyan-300 text-sm">
                Competencias
              </span>
              <span className="px-4 py-2 bg-gray-800/50 rounded-lg text-cyan-300 text-sm">
                Análisis Técnico
              </span>
            </div>
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
