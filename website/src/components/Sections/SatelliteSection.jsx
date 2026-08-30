import { useState } from 'react';
import { 
  Satellite, 
  Maximize2, 
  Eye, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export function SatelliteSection({ satelliteData, onOpenSarModal }) {
  const [showSensorDetails, setShowSensorDetails] = useState(false);

  const meta = satelliteData?.satellite_metadata || {};
  const char = satelliteData?.slick_characterization || {};
  const centroid = char.centroid || { lat: 16.5000, lon: 82.8000 };
  const sarOverlay = satelliteData?.sar_image_overlay || {};

  return (
    <section id="section-satellite" className="sci-scroll-section">
      {/* 1. Header with Clean Title & Subtitle */}
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle blue">
            <Satellite size={24} />
          </div>
          <div>
            <span className="sci-section-tag">STAGE 01 & 02</span>
            <h2 className="sci-section-title">Satellite Observation</h2>
            <p className="sci-section-subtitle">Sentinel-1 SAR oil spill detection</p>
          </div>
        </div>
        <span className="sci-badge badge-blue text-sm">SENTINEL-1A C-SAR</span>
      </div>

      {/* 2. Plain-English Intro */}
      <p className="sci-section-intro">
        Satellite synthetic aperture radar (SAR) remote sensing detects sea-surface capillary wave damping anomalies caused by oil slicks, extracting the initial spill boundary and geometry for trajectory modeling.
      </p>

      {/* 3. 2-Column Grid: Left SAR Image Viewer, Right Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Left Column (7 cols): SAR Image Preview */}
        <div className="lg:col-span-7 sci-content-card">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Sentinel-1 C-SAR Amplitude Scene</span>
              <span className="sci-tag tag-cyan">SAR SCENE</span>
            </div>
            <button 
              className="sci-btn btn-sm btn-outline"
              onClick={onOpenSarModal}
              title="Expand Full Screen Radar Scene"
            >
              <Eye size={14} />
              <span>Full Screen SAR</span>
              <Maximize2 size={13} />
            </button>
          </div>

          <div className="sar-hero-image-wrap">
            <img 
              src={sarOverlay.url || "/sentinel1_sar_scene.png"} 
              alt="Sentinel-1 SAR Radar Scene" 
              className="sar-hero-img"
            />
            {/* SVG Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <svg viewBox="0 0 400 250" className="w-full h-full">
                <rect x="90" y="75" width="220" height="98" fill="none" stroke="#00d4ff" strokeWidth="1.8" strokeDasharray="5, 5" />
                <ellipse 
                  cx="200" 
                  cy="124" 
                  rx="85" 
                  ry="32" 
                  fill="rgba(234, 88, 12, 0.32)" 
                  stroke="#ea580c" 
                  strokeWidth="2.8" 
                />
                <circle cx="200" cy="124" r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                <text x="200" y="195" fill="#ffffff" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.9))">
                  Detected Slick: {char.area_km2 || '12.45'} km² | Major Axis: {char.length_major_axis_km || '6.80'} km
                </text>
              </svg>
            </div>
            <div className="sar-hero-badge">
              <span>Sentinel-1A C-SAR Dual-Pol (VV+VH) • Δσ₀ = -4.8 dB Damping Anomaly</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span><strong>Centroid:</strong> {centroid.lat?.toFixed(4)}° N, {centroid.lon?.toFixed(4)}° E</span>
            <span><strong>Acquisition:</strong> {meta.acquisition_time || '2026-08-28 14:30:00 UTC'}</span>
          </div>
        </div>

        {/* Right Column (5 cols): Geometric Properties & Specs */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="sci-hero-stat-box">
              <span className="hero-stat-lbl">SPILL AREA</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="hero-stat-num text-blue-600">{char.area_km2 || '12.45'}</span>
                <span className="hero-stat-unit">km²</span>
              </div>
              <span className="hero-stat-sub">SAR Segmentation</span>
            </div>

            <div className="sci-hero-stat-box">
              <span className="hero-stat-lbl">ESTIMATED AGE</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="hero-stat-num text-amber-600">~{char.estimated_age_hours || '6.5'}</span>
                <span className="hero-stat-unit">hrs</span>
              </div>
              <span className="hero-stat-sub">Spill Weathering</span>
            </div>

            <div className="sci-hero-stat-box">
              <span className="hero-stat-lbl">MAJOR AXIS</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="hero-stat-num text-slate-900">{char.length_major_axis_km || '6.80'}</span>
                <span className="hero-stat-unit">km</span>
              </div>
              <span className="hero-stat-sub">Length Extent</span>
            </div>

            <div className="sci-hero-stat-box">
              <span className="hero-stat-lbl">ORIENTATION</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="hero-stat-num text-slate-900">{char.orientation_deg?.toFixed(1) || '44.2'}°</span>
                <span className="hero-stat-unit">NE</span>
              </div>
              <span className="hero-stat-sub">Elongation Angle</span>
            </div>
          </div>

          {/* Technical SAR Sensor Specifications Card */}
          <div className="sci-content-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                SENSOR SPECIFICATIONS
              </span>
              <button 
                className="sci-details-toggle-btn"
                onClick={() => setShowSensorDetails(!showSensorDetails)}
              >
                <span>{showSensorDetails ? 'Hide details' : 'View details'}</span>
                {showSensorDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            <div className="space-y-2 text-xs mt-3">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sensor & Platform:</span>
                <span className="font-semibold text-slate-900">{meta.sensor || 'Sentinel-1A C-SAR'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Spatial Resolution:</span>
                <span className="font-mono font-semibold text-slate-900">10 m × 10 m (IW GRDH)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Acquisition Pass:</span>
                <span className="font-semibold text-slate-900">{meta.orbit_pass || 'Descending (Track 165)'}</span>
              </div>
            </div>

            {showSensorDetails && (
              <div className="sci-details-drawer space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Polarization Channel:</span>
                  <span className="font-mono font-bold text-slate-800">Dual-Pol (VV + VH)</span>
                </div>
                <div className="flex justify-between">
                  <span>Mean Incidence Angle:</span>
                  <span className="font-mono font-bold text-slate-800">38.4°</span>
                </div>
                <div className="flex justify-between">
                  <span>Backscatter Damping (Δσ₀):</span>
                  <span className="font-mono font-bold text-rose-700">-4.8 dB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
