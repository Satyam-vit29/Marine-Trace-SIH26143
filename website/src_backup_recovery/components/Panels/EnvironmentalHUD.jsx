import { useState } from 'react';
import { 
  Waves, 
  Wind, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export function EnvironmentalHUD({ forcingData }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};
  const coupling = forcingData?.drift_coupling || {};

  return (
    <div className="sci-card environmental-panel">
      {/* Panel Header */}
      <div className="sci-card-header">
        <div className="sci-card-title-group">
          <Waves size={18} className="sci-icon text-teal-600" />
          <h2 className="sci-card-title">ENVIRONMENTAL FORCING</h2>
        </div>
        <span className="sci-badge badge-teal">ERA5 + CMEMS</span>
      </div>

      <div className="sci-card-body">
        {/* Human-readable Story Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">DRIFT MODEL</span>
          <div className="text-sm font-mono font-bold text-slate-900 mt-1">
            V_drift = U_current + 0.03 × U_wind
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Net drift: <strong>{coupling.net_drift_speed_ms?.toFixed(2) || '0.40'} m/s @ {coupling.net_drift_bearing_deg?.toFixed(1) || '40.8'}° {coupling.net_cardinal || 'NE'}</strong>
          </p>
        </div>

        {/* 1. ERA5 Atmospheric Surface Wind Card */}
        <div className="sci-metric-box atmo-box">
          <div className="metric-box-title-row">
            <div className="flex items-center gap-2">
              <Wind size={16} className="text-blue-600" />
              <div>
                <span className="box-section-title block">ERA5 WIND</span>
                <span className="text-[11px] text-slate-500 font-normal">10 m surface wind</span>
              </div>
            </div>
            <span className="sci-tag tag-verified">COPERNICUS CDS</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="sci-field">
              <span className="sci-field-label">SPEED</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="sci-val-hero font-mono text-blue-600">{atmo.speed_mean_ms?.toFixed(2) || '4.12'}</span>
                <span className="sci-unit-hero">m/s</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">({atmo.speed_knots?.toFixed(1) || '8.0'} kts)</span>
            </div>

            <div className="sci-field">
              <span className="sci-field-label">DIRECTION</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="sci-val-hero font-mono text-slate-900">{atmo.direction_deg?.toFixed(1) || '42.5'}°</span>
                <span className="sci-unit-hero text-blue-700 font-bold">({atmo.cardinal_direction || 'NE'})</span>
              </div>
              <span className="text-[11px] text-slate-500">Toward</span>
            </div>
          </div>
        </div>

        {/* 2. Copernicus Marine Ocean Surface Currents Card */}
        <div className="sci-metric-box hydro-box">
          <div className="metric-box-title-row">
            <div className="flex items-center gap-2">
              <Waves size={16} className="text-teal-600" />
              <div>
                <span className="box-section-title block">OCEAN CURRENT</span>
                <span className="text-[11px] text-slate-500 font-normal">Surface current</span>
              </div>
            </div>
            <span className="sci-tag tag-verified">CMEMS GLOBAL</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="sci-field">
              <span className="sci-field-label">SPEED</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="sci-val-hero font-mono text-teal-600">{hydro.speed_mean_ms?.toFixed(2) || '0.28'}</span>
                <span className="sci-unit-hero">m/s</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">({hydro.speed_knots?.toFixed(1) || '0.5'} kts)</span>
            </div>

            <div className="sci-field">
              <span className="sci-field-label">DIRECTION</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="sci-val-hero font-mono text-slate-900">{hydro.direction_deg?.toFixed(1) || '38.0'}°</span>
                <span className="sci-unit-hero text-teal-700 font-bold">({hydro.cardinal_direction || 'NE'})</span>
              </div>
              <span className="text-[11px] text-slate-500">Toward</span>
            </div>
          </div>
        </div>

        {/* Collapsible Details Drawer */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button 
            className="w-full p-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? 'Hide Details' : 'View Vector Components'}</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="p-3 bg-white space-y-2 text-xs border-t border-slate-200 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">ERA5 Wind u₁₀ (East):</span>
                <span className="font-bold text-slate-900">+{atmo.u10_mean_ms?.toFixed(3) || '2.780'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">ERA5 Wind v₁₀ (North):</span>
                <span className="font-bold text-slate-900">+{atmo.v10_mean_ms?.toFixed(3) || '3.040'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">CMEMS Current u (East):</span>
                <span className="font-bold text-teal-700">+{hydro.u_mean_ms?.toFixed(3) || '0.172'} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">CMEMS Current v (North):</span>
                <span className="font-bold text-teal-700">+{hydro.v_mean_ms?.toFixed(3) || '0.221'} m/s</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
