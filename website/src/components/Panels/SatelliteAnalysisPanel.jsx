import { useState } from 'react';
import { 
  Satellite, 
  Maximize2, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2
} from 'lucide-react';

export function SatelliteAnalysisPanel({ 
  satelliteData, 
  onOpenSarModal,
  onFocusSpill 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const meta = satelliteData?.satellite_metadata || {};
  const char = satelliteData?.slick_characterization || {};
  const centroid = char.centroid || { lat: 18.5000, lon: 70.0000 };
  const sarOverlay = satelliteData?.sar_image_overlay || {};

  return (
    <div className="sci-card satellite-panel">
      {/* 1. Panel Header */}
      <div className="sci-card-header">
        <div className="sci-card-title-group">
          <Satellite size={18} className="sci-icon text-blue-600" />
          <h2 className="sci-card-title">SATELLITE OBSERVATION</h2>
        </div>
        <span className="sci-badge badge-blue">SENTINEL-1 C-SAR</span>
      </div>

      <div className="sci-card-body">
        {/* Detection Status Banner */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">OIL SPILL DETECTED</span>
              <span className="text-xs text-emerald-800">C-Band SAR Backscatter Anomaly Confirmed</span>
            </div>
          </div>
          <span className="sci-tag tag-verified">CONFIRMED</span>
        </div>

        {/* 2. Embedded Static SAR Image Panel with Detected Slick Mask */}
        <div className="sar-preview-container" onClick={onOpenSarModal} title="Click to View Full Screen Radar Scene">
          <div className="sar-preview-header">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <span>🛰️</span>
              <span>SAR IMAGE + DETECTED SLICK OVERLAY</span>
            </span>
            <span className="sci-tag tag-cyan">DEMO SCENE</span>
          </div>

          <div className="sar-preview-img-wrap">
            <img 
              src={sarOverlay.url || "/sentinel1_sar_scene.png"} 
              alt="Sentinel-1 SAR Radar Scene" 
              className="sar-preview-img"
            />
            {/* SVG mask overlay representing detected oil slick boundary */}
            <div className="sar-preview-mask-overlay">
              <svg viewBox="0 0 400 250" className="w-full h-full">
                <ellipse 
                  cx="200" 
                  cy="125" 
                  rx="75" 
                  ry="28" 
                  fill="rgba(234, 88, 12, 0.35)" 
                  stroke="#ea580c" 
                  strokeWidth="2.2" 
                />
                <circle cx="200" cy="125" r="3.5" fill="#ffffff" />
              </svg>
            </div>
            <div className="sar-preview-badge">
              <span>DEMONSTRATION SATELLITE OBSERVATION</span>
            </div>
          </div>
        </div>

        {/* 3. Primary Core Metrics (Clean & Concise) */}
        <div className="sci-metric-box" onClick={onFocusSpill} title="Click to Center Map on Spill">
          <div className="grid grid-cols-2 gap-3">
            <div className="sci-field">
              <span className="sci-field-label">SPILL AREA</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="sci-val-hero font-mono text-blue-600">{char.area_km2 || '10.38'}</span>
                <span className="sci-unit-hero">km²</span>
              </div>
            </div>

            <div className="sci-field">
              <span className="sci-field-label">ACQUISITION TIME</span>
              <span className="font-mono text-xs font-bold text-slate-900 mt-1 block">
                {meta.acquisition_time || '2026-08-28 18:00 UTC'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Observation Centroid:</span>
            <span className="font-mono font-bold text-slate-900">{centroid.lat?.toFixed(4)}° N, {centroid.lon?.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Optional Advanced Geometry Toggle */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button 
            className="w-full p-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? 'Hide Extended Geometry' : 'View Extended Geometry Details'}</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="p-3 bg-white space-y-2 text-xs border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Perimeter:</span>
                <span className="font-mono font-bold text-slate-900">{char.perimeter_km || '13.91'} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Major / Minor Axis:</span>
                <span className="font-mono font-bold text-slate-900">{char.length_major_axis_km || '6.22'} km × {char.width_minor_axis_km || '2.12'} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Major Orientation:</span>
                <span className="font-mono font-bold text-slate-900">{char.orientation_deg || '90.8'}° (East-West)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Slick Age:</span>
                <span className="font-mono font-bold text-orange-600">~{char.estimated_age_hours || '6.0'} Hours (Fay Spreading)</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
          className="sci-btn btn-view-sar"
          onClick={onOpenSarModal}
        >
          <Eye size={15} />
          <span>Expand Sentinel-1 SAR Scene</span>
          <Maximize2 size={13} />
        </button>
      </div>
    </div>
  );
}
