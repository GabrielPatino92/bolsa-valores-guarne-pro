'use client';

import { useState, useEffect } from 'react';
import { TIMEFRAMES_BY_CATEGORY, TimeframeCategory, TIMEFRAMES } from '@guarne/shared';

interface TimeframeSelectorProps {
  selected: string;
  onChange: (timeframe: string) => void;
}

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([TimeframeCategory.MINUTES]) // Minutos expandido por defecto
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = (category: TimeframeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryLabels = {
    [TimeframeCategory.TICKS]: 'TICKS',
    [TimeframeCategory.SECONDS]: 'SEGUNDOS',
    [TimeframeCategory.MINUTES]: 'MINUTOS',
    [TimeframeCategory.HOURS]: 'HORAS',
    [TimeframeCategory.DAYS]: 'DÍAS',
    [TimeframeCategory.WEEKS]: 'SEMANAS',
    [TimeframeCategory.MONTHS]: 'MESES',
    [TimeframeCategory.YEARS]: 'AÑOS',
    [TimeframeCategory.RANGES]: 'RANGOS',
  };

  const selectedTimeframe = TIMEFRAMES[selected];

  if (!mounted) {
    return (
      <div className="relative">
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 border border-gray-700">
          <span className="font-medium">{selectedTimeframe?.label || selected}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 border border-gray-700"
      >
        <span className="font-medium">{selectedTimeframe?.label || selected}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click afuera */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-h-[600px] overflow-y-auto z-50">
            {/* Botón personalizado */}
            <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 border-b border-gray-700 transition-colors">
              + Añadir intervalo personalizado
            </button>

            {/* Categorías */}
            {Object.entries(TIMEFRAMES_BY_CATEGORY).map(([category, timeframes]) => {
              if (timeframes.length === 0) return null;

              const isExpanded = expandedCategories.has(category as TimeframeCategory);

              return (
                <div key={category} className="border-b border-gray-700 last:border-0">
                  {/* Header de categoría */}
                  <button
                    onClick={() => toggleCategory(category as TimeframeCategory)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-700 flex items-center justify-between transition-colors"
                  >
                    <span className="font-semibold">{categoryLabels[category as TimeframeCategory]}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Timeframes de la categoría */}
                  {isExpanded && (
                    <div className="bg-gray-850">
                      {timeframes.map((tf) => (
                        <button
                          key={tf.id}
                          onClick={() => {
                            onChange(tf.id);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-6 py-2 text-sm transition-colors ${
                            selected === tf.id
                              ? 'bg-blue-600 text-white font-medium'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
