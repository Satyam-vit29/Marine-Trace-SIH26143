import { useState } from 'react';
import { 
  Satellite, 
  Waves,
  Wind,
  RotateCcw, 
  Award,
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Filter, 
  ExternalLink 
} from 'lucide-react';
import { getVesselColor, getVesselAssessment } from '../../utils/geoUtils';

export function InvestigationStageSection({
  currentStageId = 'SATELLITE',
  onSelectStage,
  stages = [],
  satelliteData,
  forcingData,
  originData,
  aisData,
  selectedVesselName,
  onSelectVessel,
  onOpenSarModal,
  onOpenDossier,
}) {
  const [expandedVessel, setExpandedVessel] = useState(selectedVesselName || null);

  const stageIndex = stages.findIndex((s) => s.id === currentStageId);
  const stage = stages[stageIndex] || stages[0];

  const handleNext = () => {
    if (stageIndex < stages.length - 1) {
      onSelectStage(stages[stageIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (stageIndex > 0) {
      onSelectStage(stages[stageIndex - 1].id);
    }
  };

  // Safe data properties
  const satMeta = satelliteData?.satellite_metadata || {};
  const satChar = satelliteData?.slick_characterization || {};
  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};
  const coupling = forcingData?.drift_coupling || {};
  const vessels = Array.isArray(aisData?.vessels) ? aisData.vessels : [];
  const funnel = aisData?.filter_funnel || {
    total_regional_transponders_logged: 142,
    after_spatial_bounding_box_filter: 28,
    after_temporal_hindcast_window_filter: 9,
    high_relevance_candidates_scored: 6
  };

  const originLat = originData?.probable_origin?.lat ?? 16.3820;
  const originLon = originData?.probable_origin?.lon ?? 82.6180;

  const toggleExpandVessel = (vesselName) => {
    if (onSelectVessel) {
      onSelectVessel(vesselName);
    }
    setExpandedVessel(expandedVessel === vesselName ? null : vesselName);
  };

  return (
    <section id="investigation-stages" className="sci-scroll-section sci-investigation-stage-section">
      {/* 1. Section Header & Stage Title with Quick Previous/Next Action Buttons */}
      <div className="sci-section-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="sci-section-icon-circle blue">
            <span className="font-mono font-extrabold text-base text-blue-600">
              {stage.number || String(stageIndex + 1).padStart(2, '0')}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="sci-section-tag">INVESTIGATION PIPELINE</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono font-extrabold text-[11px] text-blue-600">
                STAGE {stageIndex + 1} OF {stages.length}
              </span>
            </div>
            <h2 className="sci-section-title">
              STAGE {stage.number || String(stageIndex + 1).padStart(2, '0')} — {stage.title}: {stage.subtitle}
            </h2>
            <p className="sci-section-subtitle">{stage.description}</p>
          </div>
        </div>
      </div>

      {/* 2. Detailed Content for the ONE active stage with smooth slide-fade transition */}
      <div className="stage-content-transition-container" key={currentStageId}>
        {/* =========================================================================
            STAGE 01: DETECT (Sentinel-1 SAR Observation)
            ========================================================================= */}
        {currentStageId === 'SATELLITE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-3">
            {/* Left: SAR Image Preview */}
            <div className="lg:col-span-5">
              <div 
                className="sar-preview-container cursor-pointer group"
                onClick={onOpenSarModal}
                title="Click to View Full-Screen High Resolution Radar Scene"
              >
                <div className="sar-preview-header">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <Satellite size={14} className="text-blue-600 group-hover:rotate-12 transition-transform" />
                    <span>SENTINEL-1 C-SAR RADAR OBSERVATION</span>
                  </span>
                  <span className="sci-tag tag-cyan font-mono text-[9px] font-bold">SAR SCENE</span>
                </div>
                <div className="sar-preview-img-wrap relative">
                  <img 
                    src={satelliteData?.sar_image_overlay?.url || "/sentinel1_sar_scene.png"} 
                    alt="Sentinel-1 SAR Radar Scene" 
                    className="sar-preview-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="sar-preview-mask-overlay">
                    <svg viewBox="0 0 400 250" className="w-full h-full">
                      <ellipse cx="200" cy="125" rx="75" ry="28" fill="rgba(234, 88, 12, 0.35)" stroke="#ea580c" strokeWidth="2.2" />
                      <circle cx="200" cy="125" r="3.5" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="sar-preview-badge font-mono text-[10px]">
                    <span>CLICK FOR FULL-SCREEN RADAR SCENE ↗</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed SAR Metrics */}
            <div className="lg:col-span-7 flex flex-col gap-3.5">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide block">
                      OIL SPILL DETECTED & SEGMENTED
                    </span>
                    <span className="text-[11.5px] text-emerald-800 font-medium">
                      C-Band SAR Backscatter Damping Anomaly Confirmed
                    </span>
                  </div>
                </div>
                <span className="sci-tag tag-verified font-mono font-bold">CONFIRMED</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="stage-metric-card">
                  <span className="sci-metric-label">Slick Area</span>
                  <span className="sci-metric-val-lg font-mono font-extrabold text-slate-900">{satChar.area_km2 || '12.45'} <span className="text-xs font-normal text-slate-500">km²</span></span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Backscatter Anomaly</span>
                  <span className="sci-metric-val-lg font-mono font-extrabold text-rose-600">-4.8 dB</span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Radar Sensor</span>
                  <span className="sci-metric-val-md font-bold text-slate-800 text-xs">Sentinel-1A C-SAR</span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Acquisition Time</span>
                  <span className="sci-metric-val-md font-mono text-slate-800 text-[11px]">{satMeta.acquisition_time || '2026-08-28 14:30 UTC'}</span>
                </div>
              </div>

              {/* Sensor Technical Specifications */}
              <div className="stage-evidence-card">
                <div className="stage-evidence-title text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Sentinel-1 Satellite Sensor Parameters
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="sci-metric-label">Polarization</span>
                    <strong className="sci-metric-val-md block text-xs font-bold text-slate-800 mt-0.5">Dual-Pol (VV + VH)</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Frequency</span>
                    <strong className="sci-metric-val-md block text-xs font-bold text-slate-800 mt-0.5">5.405 GHz (C-Band)</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Resolution</span>
                    <strong className="sci-metric-val-md block text-xs font-bold text-slate-800 mt-0.5">10 m / Pixel</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Orbit Track</span>
                    <strong className="sci-metric-val-md block text-xs font-bold text-slate-800 mt-0.5">Descending (Pass 122)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 02: CHARACTERIZE (Slick Geometry)
            ========================================================================= */}
        {currentStageId === 'CHARACTERIZE' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg shadow-xs">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide block mb-1">
                AUTOMATED MORPHOMETRIC SEGMENTATION & INERTIA PRINCIPAL AXES
              </span>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                Image processing algorithms compute geometry, perimeter, and PCA principal inertia axes along regional drift alignment to estimate spill volume and age.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="stage-metric-card">
                <span className="sci-metric-label">Surface Area</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-slate-900">{satChar.area_km2 || '12.45'} <span className="text-xs font-normal text-slate-500">km²</span></span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Major Axis Length</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-slate-900">{satChar.major_axis_km || '6.80'} <span className="text-xs font-normal text-slate-500">km</span></span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Minor Axis Width</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-slate-900">{satChar.minor_axis_km || '2.33'} <span className="text-xs font-normal text-slate-500">km</span></span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Principal Orientation</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-indigo-700">{satChar.orientation_deg || '045.0'}° NE</span>
              </div>

              <div className="stage-metric-card highlight-blue">
                <span className="sci-metric-label text-blue-800">Estimated Slick Age</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-blue-950">~6.0 Hours</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 03: ENVIRONMENT (ERA5 + CMEMS)
            ========================================================================= */}
        {currentStageId === 'ENVIRONMENT' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="sci-formula-container m-0">
              <span className="sci-formula-badge-label">HYDRODYNAMIC DRIFT COUPLING FORMULA</span>
              <div className="sci-formula-math-box font-mono font-bold text-slate-900 text-base sm:text-lg">
                V_drift = U_current + 0.03 × U_wind
              </div>
              <p className="sci-formula-explanation m-0 text-xs text-slate-600">
                Coupled advection velocity: <strong className="text-slate-900 font-mono">{coupling.net_drift_speed_ms?.toFixed(2) || '0.40'} m/s @ {coupling.net_drift_bearing_deg?.toFixed(1) || '40.8'}° {coupling.net_cardinal || 'NE'}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ERA5 Wind */}
              <div className="stage-evidence-card">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Wind size={18} className="text-blue-600" />
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                      ERA5 10M SURFACE WIND
                    </span>
                  </div>
                  <span className="sci-tag tag-verified font-mono text-[9px]">COPERNICUS CDS</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Wind Speed</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-slate-900">{atmo.speed_mean_ms?.toFixed(2) || '4.12'} m/s</span>
                    <span className="text-[11px] text-slate-500 font-mono">({atmo.speed_knots?.toFixed(1) || '8.0'} kts)</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Wind Direction</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-slate-900">{atmo.direction_deg?.toFixed(1) || '42.5'}°</span>
                    <span className="text-[11px] text-slate-600 font-mono font-bold">({atmo.cardinal_direction || 'NE'})</span>
                  </div>
                </div>
              </div>

              {/* CMEMS Current */}
              <div className="stage-evidence-card">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Waves size={18} className="text-teal-600" />
                    <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                      CMEMS OCEAN SURFACE CURRENT
                    </span>
                  </div>
                  <span className="sci-tag tag-verified font-mono text-[9px]">COPERNICUS MARINE</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Current Speed</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-teal-700">{hydro.speed_mean_ms?.toFixed(2) || '0.28'} m/s</span>
                    <span className="text-[11px] text-slate-500 font-mono">({hydro.speed_knots?.toFixed(1) || '0.5'} kts)</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Current Direction</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-slate-900">{hydro.direction_deg?.toFixed(1) || '38.0'}°</span>
                    <span className="text-[11px] text-slate-600 font-mono font-bold">({hydro.cardinal_direction || 'NE'})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 04: DRIFT (Forward Forecast & Backward Hindcast)
            ========================================================================= */}
        {currentStageId === 'FORECAST' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="p-3.5 bg-cyan-50/80 border border-cyan-200/80 rounded-lg shadow-xs">
              <span className="text-xs font-extrabold text-cyan-950 uppercase tracking-wide block mb-1">
                OPENOIL 24-HOUR FORWARD DRIFT & DISPERSION SIMULATION
              </span>
              <p className="text-xs text-cyan-900 m-0 leading-relaxed">
                Lagrangian particle advection simulates forward trajectory and dispersion of 300 oil particles under ERA5 winds and CMEMS currents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Forward Forecast Card */}
              <div className="stage-evidence-card">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    FORWARD FORECAST
                  </span>
                  <span className="sci-tag tag-blue font-mono text-[9px]">+24H ADVECTION</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Time Horizon</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-slate-900">+24.0h</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Particles</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-slate-900">300 pts</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Engine</span>
                    <span className="sci-metric-val-md font-bold text-emerald-700 text-sm">OpenOil</span>
                  </div>
                </div>
              </div>

              {/* Backward Hindcast Card */}
              <div className="stage-evidence-card">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    BACKWARD HINDCAST
                  </span>
                  <span className="sci-tag tag-demo font-mono text-[9px]">-12H REVERSE</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Time Horizon</span>
                    <span className="sci-metric-val-lg font-mono font-bold text-orange-700">-12.0h</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Convergence</span>
                    <span className="sci-metric-val-md font-bold text-slate-900 text-xs">Median Cluster</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Engine</span>
                    <span className="sci-metric-val-md font-bold text-emerald-700 text-sm">OpenDrift</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 05: ORIGIN (Backward Hindcast Origin)
            ========================================================================= */}
        {currentStageId === 'HINDCAST' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="p-3.5 bg-orange-50/80 border border-orange-200/80 rounded-lg shadow-xs">
              <span className="text-xs font-extrabold text-orange-950 uppercase tracking-wide block mb-1">
                OPENDRIFT REVERSE HINDCAST ORIGIN ESTIMATION
              </span>
              <p className="text-xs text-orange-900 m-0 leading-relaxed">
                Hydrodynamic transport equations are reversed 12 hours backward from detection time to determine release origin and spatial uncertainty envelope.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="stage-metric-card">
                <span className="sci-metric-label">Origin Location</span>
                <span className="sci-metric-val-lg font-mono font-bold text-slate-900">
                  {originLat.toFixed(4)}° N, {originLon.toFixed(4)}° E
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  Geodetic WGS-84 Datum
                </span>
              </div>

              <div className="stage-metric-card highlight-orange">
                <span className="sci-metric-label text-orange-900">Uncertainty (95% CI)</span>
                <span className="sci-metric-val-lg font-mono font-extrabold text-orange-950">
                  ±2.80 km Radius
                </span>
                <span className="text-[11px] text-orange-800 font-mono mt-0.5 block">
                  Monte Carlo Dispersion Plume
                </span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Estimated Release Time</span>
                <span className="sci-metric-val-lg font-mono font-bold text-slate-900 text-sm sm:text-base">
                  2026-08-28 02:30 UTC
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                  -12.0 Hours Hindcast Window
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 06: AIS (Historic Traffic Filtering)
            ========================================================================= */}
        {currentStageId === 'CORRELATE' && (
          <div className="flex flex-col gap-4 mt-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg shadow-xs">
              <div className="flex items-center gap-2 mb-2.5">
                <Filter size={15} className="text-slate-700" />
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                  HISTORICAL AIS TRAFFIC SPATIO-TEMPORAL FILTERING FUNNEL
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center shadow-xs">
                  <span className="sci-metric-label block mb-0.5 text-[10.5px]">Total Logged</span>
                  <div className="font-mono font-extrabold text-lg text-slate-800">
                    {funnel.total_regional_transponders_logged || 142}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center shadow-xs">
                  <span className="sci-metric-label block mb-0.5 text-[10.5px]">Spatial AOI</span>
                  <div className="font-mono font-extrabold text-lg text-blue-600">
                    {funnel.after_spatial_bounding_box_filter || 28}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-center shadow-xs">
                  <span className="sci-metric-label block mb-0.5 text-[10.5px]">Temporal Window</span>
                  <div className="font-mono font-extrabold text-lg text-indigo-600">
                    {funnel.after_temporal_hindcast_window_filter || 9}
                  </div>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-center shadow-xs">
                  <span className="sci-metric-label block mb-0.5 text-[10.5px] text-rose-900">Ranked Candidates</span>
                  <div className="font-mono font-extrabold text-lg text-rose-600">
                    {vessels.length || 6}
                  </div>
                </div>
              </div>
            </div>

            <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
              CORRELATED CANDIDATES OVERVIEW ({vessels.length})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vessels.map((v, idx) => {
                const score = v.score ?? 0;
                const color = getVesselColor(score);
                const isSelected = selectedVesselName === v.vessel;

                return (
                  <div
                    key={v.mmsi || idx}
                    className={`vessel-candidate-row cursor-pointer transition-all duration-200 ${isSelected ? 'selected ring-2 ring-rose-500' : ''}`}
                    onClick={() => onSelectVessel(v.vessel)}
                  >
                    <div className="vessel-row-main">
                      <div className="vessel-identity-group">
                        <span className="vessel-rank-tag font-mono">#{idx + 1}</span>
                        <div>
                          <h4 className="vessel-name-title font-bold text-xs text-slate-900">{v.vessel}</h4>
                          <span className="vessel-meta-sub text-[11px] text-slate-500 font-mono">
                            CPA {v.cpa?.distance_km?.toFixed(2) || '1.12'} km
                          </span>
                        </div>
                      </div>
                      <span className="vessel-score-number font-mono font-extrabold text-xs" style={{ color }}>{score.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 07: ATTRIBUTE (Attribution Ranking & Evidence Decomposition)
            ========================================================================= */}
        {currentStageId === 'ATTRIBUTE' && (
          <div className="flex flex-col gap-4 mt-3">
            {/* Top Vessel Highlight Banner */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-rose-50 to-white border-1.5 border-rose-200 rounded-xl shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award size={26} className="text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-extrabold text-rose-900 uppercase tracking-wider block">
                      POTENTIALLY ASSOCIATED CANDIDATE VESSEL
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 m-0">
                      {vessels[0]?.vessel || 'MV Konkan Pride'}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      MMSI: {vessels[0]?.mmsi || '419001234'} • {vessels[0]?.vessel_type || 'Crude Oil Tanker'}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-black text-2xl text-rose-600 block leading-tight">
                    {(vessels[0]?.score ?? 96.7).toFixed(1)}%
                  </span>
                  <span className="sci-tag tag-rose font-mono text-[9px] font-bold mt-1">HIGH ASSOCIATION</span>
                </div>
              </div>
            </div>

            <div className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
              ALL 6 CANDIDATE VESSELS (CLICK TO EXPAND EVIDENCE DECOMPOSITION)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {vessels.map((v, idx) => {
                const score = v.score ?? 0;
                const color = getVesselColor(score);
                const assessment = getVesselAssessment(score);
                const isSelected = selectedVesselName === v.vessel;
                const isExpanded = expandedVessel === v.vessel;
                const cpaDist = v.cpa?.distance_km?.toFixed(2) || '1.12';
                const cpaTime = v.cpa?.time ? v.cpa.time.slice(11, 16) : '14:00';

                return (
                  <div
                    key={v.mmsi || idx}
                    className={`vessel-candidate-row cursor-pointer transition-all duration-200 ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleExpandVessel(v.vessel)}
                  >
                    <div className="vessel-row-main">
                      <div className="vessel-identity-group">
                        <span className="vessel-rank-tag font-mono">#{idx + 1}</span>
                        <div>
                          <h4 className="vessel-name-title font-bold text-xs text-slate-900">{v.vessel}</h4>
                          <span className="vessel-meta-sub text-[11px] text-slate-500">
                            {v.vessel_type || 'Tanker'} · CPA <strong>{cpaDist} km</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="vessel-score-display text-right">
                          <span className="vessel-score-number font-mono font-extrabold text-xs block" style={{ color }}>{score.toFixed(1)}%</span>
                          <span className="vessel-assessment-badge font-mono text-[9px]" style={{ color, backgroundColor: `${color}18` }}>
                            {assessment.label}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs flex flex-col gap-2 animate-slideInUp">
                        <div className="flex justify-between font-mono text-[11px]">
                          <div><span className="font-bold text-slate-500">MMSI:</span> <strong>{v.mmsi}</strong></div>
                          <div><span className="font-bold text-slate-500">CPA Time:</span> <strong>{cpaTime}Z</strong></div>
                        </div>

                        {v.score_breakdown && (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5 shadow-xs">
                            <div className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider mb-0.5">
                              5-Factor Mathematical Breakdown:
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Spatial CPA Proximity:</span>
                              <strong className="stage-evidence-value font-mono">{v.score_breakdown.spatial_proximity ?? 95}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Temporal Window Overlap:</span>
                              <strong className="stage-evidence-value font-mono">{v.score_breakdown.temporal_overlap ?? 92}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Trajectory Alignment:</span>
                              <strong className="stage-evidence-value font-mono">{v.score_breakdown.trajectory_consistency ?? 90}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Heading & Course Compatibility:</span>
                              <strong className="stage-evidence-value font-mono">{v.score_breakdown.heading_compatibility ?? 88}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Speed & Behavioral Profile:</span>
                              <strong className="stage-evidence-value font-mono">{v.score_breakdown.speed_profile ?? 85}%</strong>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          className="sci-btn btn-sm btn-primary w-full mt-1 text-xs flex items-center justify-center gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenDossier) onOpenDossier(v);
                          }}
                        >
                          <span>Inspect Complete Forensic Dossier</span>
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Stage Navigation Footer (Previous / Next) */}
      <div className="sci-stage-footer-nav flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
        <button
          type="button"
          className="sci-btn btn-outline flex items-center gap-2"
          onClick={handleBack}
          disabled={stageIndex === 0}
          title="Go to Previous Stage"
        >
          <ChevronLeft size={16} />
          <span>PREVIOUS STAGE</span>
        </button>

        <div className="flex items-center gap-2">
          {stages.map((stg, idx) => (
            <span
              key={stg.id}
              className={`inline-block rounded-full transition-all duration-300 ${
                idx === stageIndex 
                  ? 'bg-blue-600 w-7 h-2.5 shadow-xs' 
                  : (idx < stageIndex ? 'bg-emerald-500 w-2.5 h-2.5' : 'bg-slate-300 w-2.5 h-2.5')
              }`}
              title={`Stage ${idx + 1}: ${stg.title}`}
            />
          ))}
          <span className="text-xs font-mono font-extrabold text-slate-500 ml-2">
            STAGE {stageIndex + 1} / {stages.length}
          </span>
        </div>

        {stageIndex < stages.length - 1 ? (
          <button
            type="button"
            className="sci-btn btn-primary flex items-center gap-2"
            onClick={handleNext}
            title={`Proceed to Stage ${stageIndex + 2}`}
          >
            <span>NEXT → {stages[stageIndex + 1].title}</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="sci-btn btn-primary flex items-center gap-2"
            onClick={() => onSelectStage(stages[0].id)}
            title="Restart Investigation from Stage 01"
          >
            <RotateCcw size={15} />
            <span>RESTART INVESTIGATION</span>
          </button>
        )}
      </div>
    </section>
  );
}

