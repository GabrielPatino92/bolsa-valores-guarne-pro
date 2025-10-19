'use client';

import { useState, useEffect } from 'react';

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'baseline' | 'histogram';

export interface ChartTypeInfo {
  type: ChartType;
  name: string;
  icon: string;
  description: string;
}

const CHART_TYPES: ChartTypeInfo[] = [
  {
    type: 'candlestick',
    name: 'Velas',
    icon: '📊',
    description: 'Muestra Open, High, Low, Close'
  },
  {
    type: 'line',
    name: 'Línea',
    icon: '📈',
    description: 'Gráfico de línea simple'
  },
  {
    type: 'area',
    name: 'Área',
    icon: '🏔️',
    description: 'Gráfico de área rellena'
  },
  {
    type: 'bar',
    name: 'Barras',
    icon: '📊',
    description: 'Barras OHLC tradicionales'
  },
  {
    type: 'baseline',
    name: 'Baseline',
    icon: '〰️',
    description: 'Línea base con relleno'
  },
  {
    type: 'histogram',
    name: 'Histograma',
    icon: '📊',
    description: 'Gráfico de barras verticales'
  },
];

interface ChartTypeSelectorProps {
  selected: ChartType;
  onChange: (type: ChartType) => void;
}

export function ChartTypeSelector({ selected, onChange }: ChartTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedType = CHART_TYPES.find(t => t.type === selected);

  if (!mounted) {
    return (
      <div className="relative">
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700">
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
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 flex items-center gap-2"
        title={selectedType?.description}
      >
        <span className="text-lg">{selectedType?.icon}</span>
        <span className="font-medium hidden sm:inline">{selectedType?.name}</span>
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
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full left-0 mt-2 w-[280px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-400 px-3 py-2">
                TIPO DE GRÁFICO
              </div>
              {CHART_TYPES.map((chartType) => (
                <button
                  key={chartType.type}
                  onClick={() => {
                    onChange(chartType.type);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded flex items-center gap-3 hover:bg-gray-700 transition-colors ${
                    chartType.type === selected ? 'bg-gray-700' : ''
                  }`}
                >
                  <span className="text-xl">{chartType.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{chartType.name}</div>
                    <div className="text-xs text-gray-400">{chartType.description}</div>
                  </div>
                  {chartType.type === selected && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
