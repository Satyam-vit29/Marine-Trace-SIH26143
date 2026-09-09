import { useState } from 'react';
import { ChevronRight, ChevronLeft, Layers } from 'lucide-react';

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = [
    { label: 'Spill', symbol: '●', color: '#ea580c' },
    { label: 'Forecast', symbol: '―', color: '#00d4ff' },
    { label: 'Hindcast', symbol: '―', color: '#ff7a00' },
    { label: 'Origin', symbol: '◎', color: '#ea580c' },
    { label: 'Wind', symbol: '→', color: '#2563eb' },
    { label: 'Current', symbol: '→', color: '#0d9488' },
    { label: 'AIS Vessel', symbol: '●', color: '#e11d48' },
  ];

  return (
    <div className="map-bottom-left-symbology" aria-label="Map Symbology Legend">
      <div className={`symbology-dock ${isOpen ? 'is-expanded' : 'is-collapsed'}`}>
        {/* Toggle Button */}
        <button
          type="button"
          className="symbology-toggle-pill"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse Symbology' : 'Expand Symbology'}
        >
          <Layers size={11} className="text-slate-700 flex-shrink-0" />
          <span className="symbology-pill-label">SYMBOLOGY</span>
          {isOpen ? (
            <ChevronLeft size={11} className="text-slate-500 flex-shrink-0" />
          ) : (
            <ChevronRight size={11} className="text-slate-500 flex-shrink-0" />
          )}
        </button>

        {/* Horizontal Legend Items Strip */}
        <div className="symbology-items-strip">
          {legendItems.map((item) => (
            <div key={item.label} className="symbology-item-chip">
              <span 
                className="symbology-chip-dot" 
                style={{ 
                  color: item.color,
                  backgroundColor: `${item.color}18`,
                  borderColor: `${item.color}55` 
                }}
              >
                {item.symbol}
              </span>
              <span className="symbology-chip-name">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
