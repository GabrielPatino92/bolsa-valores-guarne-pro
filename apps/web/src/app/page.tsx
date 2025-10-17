import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative text-center max-w-4xl">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mb-8">
          <span className="text-4xl">📈</span>
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Bolsa de Valores
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Guarne Pro
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-gray-300 mb-4">
          Plataforma de trading consolidado profesional
        </p>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          Conecta múltiples exchanges y brokers en un solo lugar. Binance, eToro, MetaTrader, TradingView y más.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all backdrop-blur-xl"
          >
            Crear Cuenta
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <span className="text-4xl mb-3 block">🔗</span>
            <h3 className="text-white font-bold mb-2">Multi-Plataforma</h3>
            <p className="text-gray-400 text-sm">
              Conecta con 11+ plataformas de trading
            </p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <span className="text-4xl mb-3 block">📊</span>
            <h3 className="text-white font-bold mb-2">Análisis Avanzado</h3>
            <p className="text-gray-400 text-sm">
              Herramientas profesionales de análisis técnico
            </p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50">
            <span className="text-4xl mb-3 block">🚀</span>
            <h3 className="text-white font-bold mb-2">Backtesting</h3>
            <p className="text-gray-400 text-sm">
              Prueba tus estrategias con datos históricos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
