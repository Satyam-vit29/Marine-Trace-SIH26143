import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);

  const legendItems = [
    { label: 'Spill', symbol: '●', color: '#ea580c' },
    { label: 'Forward Drift', symbol: '―', color: '#00d4ff' },
    { label: 'Backward Drift', symbol: '―', color: '#ff7a00' },
    { label: 'Origin (±2.8km)', symbol: '◎', color: '#ea580c' },
    { label: 'Wind (ERA5)', symbol: '→', color: '#2563eb' },
    { label: 'Current (CMEMS)', symbol: '→', color: '#0d9488' },
    { label: 'AIS Candidate', symbol: '●', color: '#e11d48' },
  ];

  return (
    <div className="map-floating-legend-container" aria-label="Map Symbology Legend">
      <button
        type="button"
        className={`legend-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Map Symbology Legend"
      >
        <Info size={13} className="text-slate-600" />
        <span className="font-bold text-xs text-slate-800">SYMBOLOGY</span>
        {isOpen ? <ChevronDown size={13} className="text-slate-500" /> : <ChevronUp size={13} className="text-slate-500" />}
      </button>

      {isOpen && (
        <div className="legend-popover-body">
          <div className="legend-items-grid">
            {legendItems.map((item) => (
              <div key={item.label} className="legend-item-pill">
                <span className="legend-symbol font-mono font-bold" style={{ color: item.color }}>
                  {item.symbol}
                </span>
                <span className="legend-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
