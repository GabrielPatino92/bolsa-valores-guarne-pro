'use client';

import { useState, useEffect } from 'react';

export interface SymbolInfo {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'stocks';
  icon?: string;
}

// Lista de activos disponibles
const AVAILABLE_SYMBOLS: SymbolInfo[] = [
  // Criptomonedas principales
  { symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', icon: '₿' },
  { symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', icon: 'Ξ' },
  { symbol: 'BNB/USDT', name: 'Binance Coin', category: 'crypto', icon: 'BNB' },
  { symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', icon: 'SOL' },
  { symbol: 'XRP/USDT', name: 'Ripple', category: 'crypto', icon: 'XRP' },
  { symbol: 'ADA/USDT', name: 'Cardano', category: 'crypto', icon: 'ADA' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', category: 'crypto', icon: 'AVAX' },
  { symbol: 'DOT/USDT', name: 'Polkadot', category: 'crypto', icon: 'DOT' },
  { symbol: 'MATIC/USDT', name: 'Polygon', category: 'crypto', icon: 'MATIC' },
  { symbol: 'LINK/USDT', name: 'Chainlink', category: 'crypto', icon: 'LINK' },

  // Forex
  { symbol: 'EUR/USD', name: 'Euro vs Dólar', category: 'forex', icon: '€/$' },
  { symbol: 'GBP/USD', name: 'Libra vs Dólar', category: 'forex', icon: '£/$' },
  { symbol: 'USD/JPY', name: 'Dólar vs Yen', category: 'forex', icon: '$/¥' },

  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', icon: '🍎' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', icon: 'G' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'stocks', icon: 'MS' },
];

interface SymbolSelectorProps {
  selected: string;
  onChange: (symbol: string) => void;
}

export function SymbolSelector({ selected, onChange }: SymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'crypto' | 'forex' | 'stocks'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedSymbol = AVAILABLE_SYMBOLS.find(s => s.symbol === selected);

  const filteredSymbols = AVAILABLE_SYMBOLS.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  if (!mounted) {
    return (
      <div className="relative">
        <button className="px-6 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 min-w-[200px]">
          <span className="font-medium">Cargando...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 min-w-[200px] flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedSymbol?.icon || '📊'}</span>
          <div className="text-left">
            <div className="font-bold">{selected}</div>
            <div className="text-xs text-gray-400">{selectedSymbol?.name}</div>
          </div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic afuera */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel del dropdown */}
          <div className="absolute top-full left-0 mt-2 w-[400px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 max-h-[500px] flex flex-col">
            {/* Buscador */}
            <div className="p-3 border-b border-gray-700">
              <input
                type="text"
                placeholder="Buscar activo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Filtros de categoría */}
            <div className="p-3 border-b border-gray-700 flex gap-2">
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  category === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setCategory('crypto')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  category === 'crypto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setCategory('forex')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  category === 'forex'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Forex
              </button>
              <button
                onClick={() => setCategory('stocks')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  category === 'stocks'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Acciones
              </button>
            </div>

            {/* Lista de símbolos */}
            <div className="overflow-y-auto flex-1">
              {filteredSymbols.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No se encontraron activos
                </div>
              ) : (
                filteredSymbols.map((symbolInfo) => (
                  <button
                    key={symbolInfo.symbol}
                    onClick={() => {
                      onChange(symbolInfo.symbol);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 transition-colors ${
                      symbolInfo.symbol === selected ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <span className="text-2xl">{symbolInfo.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{symbolInfo.symbol}</div>
                      <div className="text-sm text-gray-400">{symbolInfo.name}</div>
                    </div>
                    {symbolInfo.symbol === selected && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer con info */}
            <div className="p-3 border-t border-gray-700 bg-gray-900/50">
              <div className="text-xs text-gray-400 text-center">
                {filteredSymbols.length} activo{filteredSymbols.length !== 1 ? 's' : ''} disponible{filteredSymbols.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
