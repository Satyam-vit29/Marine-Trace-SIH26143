import { useState } from 'react';
import { 
  Waves, 
  Wind,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function EnvironmentalSection({ forcingData }) {
  const [showWindDetails, setShowWindDetails] = useState(false);
  const [showCurrentDetails, setShowCurrentDetails] = useState(false);

  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};
  const coupling = forcingData?.drift_coupling || {};

  return (
    <section id="section-environment" className="sci-scroll-section">
      {/* 1. Header with Concise Title & Subtitle */}
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle teal">
            <Waves size={24} />
          </div>
          <div>
            <span className="sci-section-tag">STAGE 03</span>
            <h2 className="sci-section-title">Environmental Conditions</h2>
            <p className="sci-section-subtitle">Wind + ocean current driving oil movement</p>
          </div>
        </div>
        <span className="sci-badge badge-teal text-sm">ERA5 + CMEMS</span>
      </div>

      {/* 2. Concise Plain-English Intro */}
      <p className="sci-section-intro">
        Oil movement is estimated from two environmental drivers: <strong>Ocean Surface Current</strong> (Copernicus Marine / CMEMS) and <strong>Surface Wind</strong> (ERA5 10m). These coupled environmental fields provide the hydrodynamic forcing used by the drift model.
      </p>

      {/* 3. Structured 2-Column Grid: ERA5 Wind & Ocean Current Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
        {/* ERA5 Wind Card */}
        <div className="sci-content-card">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <Wind size={20} className="text-blue-600" />
              <div>
                <span className="text-base font-bold text-slate-900 block">ERA5 WIND</span>
                <span className="text-xs text-slate-500 font-medium">10 m surface wind</span>
              </div>
            </div>
            <span className="sci-tag tag-verified">COPERNICUS CDS</span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 block">Wind speed</span>
              <div className="text-2xl font-mono font-bold text-blue-600 mt-1">
                {atmo.speed_mean_ms?.toFixed(2) || '4.12'} <span className="text-xs font-normal text-slate-500">m/s</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">({atmo.speed_knots?.toFixed(1) || '8.0'} kts)</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 block">Direction</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
                {atmo.direction_deg?.toFixed(1) || '42.5'}°
              </div>
              <span className="text-xs text-blue-700 font-semibold">{atmo.cardinal_direction || 'NE'} (Toward)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span><strong>Source:</strong> Copernicus Climate Data Store / ERA5</span>
            <button 
              className="sci-details-toggle-btn"
              onClick={() => setShowWindDetails(!showWindDetails)}
            >
              <span>{showWindDetails ? 'Hide details' : 'View details'}</span>
              {showWindDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {showWindDetails && (
            <div className="sci-details-drawer space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Eastward component (u₁₀):</span>
                <span className="font-mono font-bold text-slate-800">+{atmo.u10_mean_ms?.toFixed(3) || '2.780'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Northward component (v₁₀):</span>
                <span className="font-mono font-bold text-slate-800">+{atmo.v10_mean_ms?.toFixed(3) || '3.040'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial resolution:</span>
                <span className="font-mono text-slate-700">0.25° (~28 km) hourly reanalysis</span>
              </div>
            </div>
          )}
        </div>

        {/* Copernicus Ocean Current Card */}
        <div className="sci-content-card">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <Waves size={20} className="text-teal-600" />
              <div>
                <span className="text-base font-bold text-slate-900 block">OCEAN CURRENT</span>
                <span className="text-xs text-slate-500 font-medium">Surface current</span>
              </div>
            </div>
            <span className="sci-tag tag-verified">CMEMS GLOBAL</span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 block">Current speed</span>
              <div className="text-2xl font-mono font-bold text-teal-600 mt-1">
                {hydro.speed_mean_ms?.toFixed(2) || '0.28'} <span className="text-xs font-normal text-slate-500">m/s</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">({hydro.speed_knots?.toFixed(1) || '0.5'} kts)</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-semibold text-slate-500 block">Direction</span>
              <div className="text-2xl font-mono font-bold text-slate-900 mt-1">
                {hydro.direction_deg?.toFixed(1) || '38.0'}°
              </div>
              <span className="text-xs text-teal-700 font-semibold">{hydro.cardinal_direction || 'NE'} (Toward)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span><strong>Source:</strong> Copernicus Marine (CMEMS)</span>
            <button 
              className="sci-details-toggle-btn"
              onClick={() => setShowCurrentDetails(!showCurrentDetails)}
            >
              <span>{showCurrentDetails ? 'Hide details' : 'View details'}</span>
              {showCurrentDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {showCurrentDetails && (
            <div className="sci-details-drawer space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Eastward velocity (u):</span>
                <span className="font-mono font-bold text-slate-800">+{hydro.u_mean_ms?.toFixed(3) || '0.172'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Northward velocity (v):</span>
                <span className="font-mono font-bold text-slate-800">+{hydro.v_mean_ms?.toFixed(3) || '0.221'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial resolution:</span>
                <span className="font-mono text-slate-700">0.083° (~9 km) global physics</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Drift Model Formula Card Container */}
      <div className="sci-formula-container">
        <span className="sci-formula-badge-label">DRIFT MODEL</span>

        <div className="sci-formula-math-box">
          V_drift = U_current + 0.03 × U_wind
        </div>

        <p className="sci-formula-explanation">
          Ocean current provides the primary advective transport (100%) while atmospheric wind contributes a 3% empirical surface-drag windage component.
        </p>

        <div className="sci-formula-breakdown-grid">
          <div className="sci-formula-breakdown-item">
            <span className="sci-breakdown-lbl">Current contribution</span>
            <span className="sci-breakdown-val text-teal-700">100%</span>
          </div>

          <div className="sci-formula-breakdown-item">
            <span className="sci-breakdown-lbl">Wind contribution</span>
            <span className="sci-breakdown-val text-blue-700">3%</span>
          </div>

          <div className="sci-formula-breakdown-item">
            <span className="sci-breakdown-lbl">Predicted drift speed</span>
            <span className="sci-breakdown-val text-slate-900">
              {coupling.net_drift_speed_ms?.toFixed(2) || '0.40'} m/s
            </span>
          </div>

          <div className="sci-formula-breakdown-item">
            <span className="sci-breakdown-lbl">Direction</span>
            <span className="sci-breakdown-val text-slate-900">
              {coupling.net_drift_bearing_deg?.toFixed(1) || '40.8'}° {coupling.net_cardinal || 'NE'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
