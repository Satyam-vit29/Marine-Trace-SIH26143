import { 
  Layers, 
  Droplet, 
  Wind, 
  Waves, 
  RotateCcw, 
  Ship, 
  Target
} from 'lucide-react';

export function LayerControlHUD({ layers, onToggleLayer }) {
  const layerButtons = [
    { key: 'spill', label: 'Spill', icon: <Droplet size={13} />, color: '#ea580c' },
    { key: 'forward', label: 'Forward Drift', icon: <Wind size={13} />, color: '#00d4ff' },
    { key: 'backward', label: 'Backward Hindcast', icon: <RotateCcw size={13} />, color: '#ff7a00' },
    { key: 'origin', label: 'Probable Origin', icon: <Target size={13} />, color: '#ea580c' },
    { key: 'wind', label: 'Wind', icon: <Wind size={13} />, color: '#2563eb' },
    { key: 'currents', label: 'Ocean Current', icon: <Waves size={13} />, color: '#0d9488' },
    { key: 'vessels', label: 'AIS Vessels', icon: <Ship size={13} />, color: '#e11d48' },
  ];

  return (
    <div className="map-layer-control-hud-light" aria-label="Map Layers Visibility Controls">
      <div className="layer-hud-header-light">
        <Layers size={13} className="text-slate-700" />
        <span className="font-bold text-xs text-slate-800 tracking-wide">LAYERS</span>
      </div>
      <div className="layer-hud-buttons-light">
        {layerButtons.map((btn) => {
          const isActive = layers[btn.key];
          return (
            <button
              key={btn.key}
              className={`layer-toggle-chip-light ${isActive ? 'active' : 'inactive'}`}
              onClick={() => onToggleLayer(btn.key)}
              title={`Toggle ${btn.label} Visibility`}
            >
              <span 
                className="layer-chip-indicator" 
                style={{ backgroundColor: isActive ? btn.color : '#cbd5e1' }} 
              />
              <span className="layer-chip-icon">{btn.icon}</span>
              <span className="layer-chip-label">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
