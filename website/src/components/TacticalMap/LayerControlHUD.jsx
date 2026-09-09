import { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Droplet, 
  Wind, 
  Waves, 
  RotateCcw, 
  Ship, 
  Target,
  ChevronDown,
  ChevronUp,
  X,
  Check
} from 'lucide-react';

export function LayerControlHUD({ layers, onToggleLayer }) {
  const [isOpen, setIsOpen] = useState(false);
  const hudRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (hudRef.current && !hudRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const layerItems = [
    { key: 'spill', label: 'Spill', icon: <Droplet size={14} />, color: '#ea580c' },
    { key: 'forward', label: 'Forward Drift', icon: <Wind size={14} />, color: '#00d4ff' },
    { key: 'backward', label: 'Backward Hindcast', icon: <RotateCcw size={14} />, color: '#ff7a00' },
    { key: 'origin', label: 'Probable Origin', icon: <Target size={14} />, color: '#ea580c' },
    { key: 'wind', label: 'Wind', icon: <Wind size={14} />, color: '#2563eb' },
    { key: 'currents', label: 'Ocean Current', icon: <Waves size={14} />, color: '#0d9488' },
    { key: 'vessels', label: 'AIS Vessels', icon: <Ship size={14} />, color: '#e11d48' },
  ];

  const activeCount = layerItems.filter((item) => layers[item.key]).length;

  return (
    <div className="map-layer-dropdown-container" ref={hudRef} aria-label="Map Layers Control">
      {/* Compact Dropdown Trigger Button */}
      <button
        type="button"
        className={`layer-dropdown-trigger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Map Layers"
      >
        <Layers size={14} className="text-slate-700" />
        <span className="font-bold text-xs text-slate-800 tracking-wide">LAYERS</span>
        <span className="layer-active-badge font-mono">{activeCount}</span>
        {isOpen ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="layer-dropdown-popover">
          <div className="layer-popover-header">
            <div className="flex items-center gap-1.5">
              <Layers size={13} className="text-slate-600" />
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">MAP LAYERS</span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 p-0.5"
              onClick={() => setIsOpen(false)}
            >
              <X size={14} />
            </button>
          </div>

          <div className="layer-popover-list">
            {layerItems.map((item) => {
              const isActive = !!layers[item.key];
              return (
                <button
                  type="button"
                  key={item.key}
                  className={`layer-popover-row ${isActive ? 'active' : ''}`}
                  onClick={() => onToggleLayer(item.key)}
                >
                  <div className={`layer-checkbox-box ${isActive ? 'checked' : ''}`} style={{ borderColor: isActive ? item.color : '#cbd5e1', backgroundColor: isActive ? item.color : 'transparent' }}>
                    {isActive && <Check size={11} className="text-white stroke-[3]" />}
                  </div>
                  <span className="layer-row-icon" style={{ color: item.color }}>{item.icon}</span>
                  <span className="layer-row-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
