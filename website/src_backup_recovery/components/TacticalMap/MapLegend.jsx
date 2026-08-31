import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`map-floating-legend-light ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="legend-header-toggle-light"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Toggle Map Symbology Legend"
      >
        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
          <Layers size={15} className="text-blue-600" />
          <span>MAP SYMBOLOGY</span>
        </div>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isExpanded && (
        <div className="legend-body-light">
          <div className="legend-item-light">
            <span className="legend-glyph-light glyph-sar-box"></span>
            <span>Sentinel-1 SAR Radar Scene (10m)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light glyph-slick-core"></span>
            <span>Detected Oil Slick Mask (10.38 km²)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-teal-600 font-extrabold text-sm">→</span>
            <span>CMEMS Ocean Current (0.21 m/s @ 076°)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-blue-600 font-extrabold text-sm">→</span>
            <span>ERA5 10m Wind (3.29 m/s @ 072°)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-cyan-500 font-bold">━</span>
            <span>Forward Drift (Cyan Particles &amp; Streamlines)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-orange-500 font-bold">━</span>
            <span>Backward Hindcast (Orange Reverse Particles)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-orange-600 font-bold">◎</span>
            <span>Probable Origin (Median Hindcast)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-orange-400 font-bold">◌</span>
            <span>Origin Uncertainty Zone (±2.8 km)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-rose-600 font-bold">━</span>
            <span>Candidate AIS Track (Score &gt;80%)</span>
          </div>

          <div className="legend-item-light">
            <span className="legend-glyph-light text-rose-600 font-mono font-bold">---</span>
            <span>Closest Point of Approach (CPA)</span>
          </div>
        </div>
      )}
    </div>
  );
}
