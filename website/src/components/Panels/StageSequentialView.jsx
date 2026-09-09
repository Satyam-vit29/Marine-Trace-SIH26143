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
  MapPin,
  Play,
  Pause
} from 'lucide-react';
import { getVesselColor, getVesselAssessment, formatCoordinates } from '../../utils/geoUtils';

export function StageSequentialView({
  currentStageId = 'SATELLITE',
  onSelectStage,
  stages = [],
  satelliteData,
  forcingData,
  originData,
  aisData,
  simulationMode,
  timeIndex,
  maxSteps,
  isPlaying,
  playbackSpeed,
  onTimeChange,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onModeChange,
  selectedVesselName,
  onSelectVessel,
  onOpenSarModal,
  onOpenDossier,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Toggle vessel card inline expansion
  const toggleExpandVessel = (vesselName) => {
    if (onSelectVessel) {
      onSelectVessel(vesselName);
    }
    setExpandedVessel(expandedVessel === vesselName ? null : vesselName);
  };

  return (
    <div className="sci-stage-sequential-card">
      {/* 1. Stage Card Header */}
      <div className="stage-card-header">
        <div className="flex items-center gap-2.5">
          <span className="stage-num-badge">
            STAGE {stage.number || String(stageIndex + 1).padStart(2, '0')}
          </span>
          <div>
            <h2 className="stage-title">{stage.title}</h2>
            <span className="stage-sub">{stage.subtitle}</span>
          </div>
        </div>
        <span className="sci-tag tag-blue font-mono text-[10px]">
          {stageIndex + 1} OF {stages.length}
        </span>
      </div>

      {/* 2. Dynamic Stage Body Content */}
      <div className="stage-card-body">
        {/* =========================================================================
            STAGE 01: DETECT (Sentinel-1 SAR)
            ========================================================================= */}
        {currentStageId === 'SATELLITE' && (
          <div className="space-y-3.5">
            {/* Status Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">OIL SPILL DETECTED</span>
                  <span className="text-xs text-emerald-800">C-Band SAR Backscatter Damping Anomaly Confirmed</span>
                </div>
              </div>
              <span className="sci-tag tag-verified">CONFIRMED</span>
            </div>

            {/* Embedded SAR Preview Card */}
            <div 
              className="sar-preview-container cursor-pointer"
              onClick={onOpenSarModal}
              title="Click to View Full-Screen High Resolution Radar Scene"
            >
              <div className="sar-preview-header">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Satellite size={14} className="text-blue-600" />
                  <span>SAR SATELLITE SCENE + OIL SLICK MASK</span>
                </span>
                <span className="sci-tag tag-cyan">DEMO SCENE</span>
              </div>
              <div className="sar-preview-img-wrap">
                <img 
                  src={satelliteData?.sar_image_overlay?.url || "/sentinel1_sar_scene.png"} 
                  alt="Sentinel-1 SAR Radar Scene" 
                  className="sar-preview-img"
                />
                <div className="sar-preview-mask-overlay">
                  <svg viewBox="0 0 400 250" className="w-full h-full">
                    <ellipse cx="200" cy="125" rx="75" ry="28" fill="rgba(234, 88, 12, 0.35)" stroke="#ea580c" strokeWidth="2.2" />
                    <circle cx="200" cy="125" r="3.5" fill="#ffffff" />
                  </svg>
                </div>
                <div className="sar-preview-badge">
                  <span>CLICK TO VIEW FULL-SCREEN SAR SCENE ↗</span>
                </div>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">SLICK AREA</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-xl font-extrabold text-blue-600">{satChar.area_km2 || '12.45'}</span>
                  <span className="text-xs text-slate-600 font-semibold">km²</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">ACQUISITION TIME</span>
                <span className="font-mono text-xs font-bold text-slate-900 mt-1 block">
                  {satMeta.acquisition_time || '2026-08-28 14:30 UTC'}
                </span>
              </div>
            </div>

            {/* Progressive Disclosure */}
            <button 
              type="button" 
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>{showAdvanced ? 'Hide Sensor Details' : 'View Sensor Details'}</span>
              {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showAdvanced && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono">
                <div className="flex justify-between"><span>Satellite:</span><strong className="text-slate-900">Sentinel-1A C-SAR</strong></div>
                <div className="flex justify-between"><span>Polarization:</span><strong className="text-slate-900">Dual-Pol (VV + VH)</strong></div>
                <div className="flex justify-between"><span>Radar Frequency:</span><strong className="text-slate-900">5.405 GHz (C-Band)</strong></div>
                <div className="flex justify-between"><span>Backscatter Anomaly:</span><strong className="text-rose-600">-4.8 dB Damping</strong></div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STAGE 02: CHARACTERIZE (Slick Geometry)
            ========================================================================= */}
        {currentStageId === 'CHARACTERIZE' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">SLICK MORPHOMETRICS</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Automated segmentation extracts geometry and PCA principal inertia axes along regional drift alignment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">SURFACE AREA</span>
                <span className="font-mono text-base font-extrabold text-blue-600">{satChar.area_km2 || '12.45'} km²</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">PERIMETER</span>
                <span className="font-mono text-base font-extrabold text-slate-900">{satChar.perimeter_km || '15.20'} km</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">MAJOR AXIS</span>
                <span className="font-mono text-base font-extrabold text-slate-900">{satChar.major_axis_km || '6.80'} km</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[11px] font-bold text-slate-500 block">ORIENTATION</span>
                <span className="font-mono text-base font-extrabold text-indigo-600">{satChar.orientation_deg || '045.0'}° NE</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-900 block">ESTIMATED SLICK AGE</span>
                <span className="text-xs text-blue-700">Derived from dispersion elongation</span>
              </div>
              <span className="font-mono font-extrabold text-base text-blue-950">~6.0 Hours</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 03: ENVIRONMENT (ERA5 + CMEMS)
            ========================================================================= */}
        {currentStageId === 'ENVIRONMENT' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">DRIFT COUPLING MODEL</span>
              <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                V_drift = U_current + 0.03 × U_wind
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Net drift: <strong>{coupling.net_drift_speed_ms?.toFixed(2) || '0.40'} m/s @ {coupling.net_drift_bearing_deg?.toFixed(1) || '40.8'}° {coupling.net_cardinal || 'NE'}</strong>
              </p>
            </div>

            {/* ERA5 Wind */}
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Wind size={15} className="text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">ERA5 10M SURFACE WIND</span>
                </div>
                <span className="sci-tag tag-verified">COPERNICUS CDS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Speed: <strong>{atmo.speed_mean_ms?.toFixed(2) || '4.12'} m/s ({atmo.speed_knots?.toFixed(1) || '8.0'} kts)</strong></div>
                <div>Direction: <strong>{atmo.direction_deg?.toFixed(1) || '42.5'}° ({atmo.cardinal_direction || 'NE'})</strong></div>
              </div>
            </div>

            {/* CMEMS Current */}
            <div className="p-3 bg-white border border-teal-200 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Waves size={15} className="text-teal-600" />
                  <span className="font-bold text-xs text-slate-900">CMEMS SURFACE OCEAN CURRENT</span>
                </div>
                <span className="sci-tag tag-verified">COPERNICUS MARINE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Speed: <strong>{hydro.speed_mean_ms?.toFixed(2) || '0.28'} m/s ({hydro.speed_knots?.toFixed(1) || '0.5'} kts)</strong></div>
                <div>Direction: <strong>{hydro.direction_deg?.toFixed(1) || '38.0'}° ({hydro.cardinal_direction || 'NE'})</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 04: DRIFT (Forward Forecast)
            ========================================================================= */}
        {currentStageId === 'FORECAST' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
              <span className="text-xs font-bold text-cyan-950 uppercase tracking-wider block">OPENOIL FORWARD DRIFT (+24H)</span>
              <p className="text-xs text-cyan-800 mt-1 leading-relaxed">
                Lagrangian transport advects 300 oil particles forward into the future under coupled wind and ocean current forcing.
              </p>
            </div>

            {/* Simulation Controls in Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`sci-btn btn-sm ${isPlaying && simulationMode === 'forward' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => {
                      if (simulationMode !== 'forward') {
                        onModeChange('forward');
                      }
                      onTogglePlay(!isPlaying);
                    }}
                  >
                    {isPlaying && simulationMode === 'forward' ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isPlaying && simulationMode === 'forward' ? 'PAUSE' : 'RUN FORECAST'}</span>
                  </button>
                  <button type="button" className="sci-btn btn-sm btn-outline" onClick={onReset} title="Reset to Step 0">
                    <RotateCcw size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${playbackSpeed === spd ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                      onClick={() => onSpeedChange(spd)}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubber Range */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>T+0h (Spill Detection)</span>
                  <span className="font-bold text-blue-700">Step {timeIndex} / {maxSteps}</span>
                  <span>T+24h (Forecast)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxSteps}
                  value={timeIndex}
                  onChange={(e) => onTimeChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono space-y-1">
              <div className="flex justify-between"><span>Mode:</span><strong className="text-blue-600">OpenOil 24h Forward</strong></div>
              <div className="flex justify-between"><span>Particles:</span><strong>300 Lagrangian Points</strong></div>
              <div className="flex justify-between"><span>Coupling:</span><strong>3.0% Wind Drag + 100% CMEMS</strong></div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 05: ORIGIN (Backward Hindcast)
            ========================================================================= */}
        {currentStageId === 'HINDCAST' && (
          <div className="space-y-3.5">
            {/* Geodetic Hero Box */}
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">ESTIMATED DISCHARGE ORIGIN</span>
              </div>
              <div className="font-mono text-lg font-extrabold text-slate-900">
                {originLat.toFixed(4)}° N, {originLon.toFixed(4)}° E
              </div>
              <span className="text-xs font-mono text-orange-800 font-semibold">
                {formatCoordinates(originLat, originLon, 'nautical')}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 block">HINDCAST</span>
                <span className="font-mono text-sm font-extrabold text-orange-600">-12.0 hrs</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 block">UNCERTAINTY</span>
                <span className="font-mono text-sm font-extrabold text-slate-900">±2.8 km</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 block">METHOD</span>
                <span className="font-mono text-[11px] font-extrabold text-emerald-700">OpenDrift</span>
              </div>
            </div>

            {/* Simulation Controls in Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className={`sci-btn btn-sm ${isPlaying && simulationMode === 'backward' ? 'btn-danger' : 'btn-orange'}`}
                  onClick={() => {
                    if (simulationMode !== 'backward') {
                      onModeChange('backward');
                    }
                    onTogglePlay(!isPlaying);
                  }}
                >
                  {isPlaying && simulationMode === 'backward' ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying && simulationMode === 'backward' ? 'PAUSE' : 'RUN BACKTRACK'}</span>
                </button>

                <button type="button" className="sci-btn btn-sm btn-outline" onClick={onReset} title="Reset">
                  <RotateCcw size={13} />
                </button>
              </div>

              <input
                type="range"
                min={0}
                max={maxSteps}
                value={timeIndex}
                onChange={(e) => onTimeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 06: AIS (Historic Traffic Filtering)
            ========================================================================= */}
        {currentStageId === 'CORRELATE' && (
          <div className="space-y-3.5">
            {/* Filter Funnel */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <Filter size={14} className="text-slate-700" />
                <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">AIS SPATIO-TEMPORAL FILTERING</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="p-1.5 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-xs text-slate-700">{funnel.total_regional_transponders_logged || 142}</div>
                  <div className="text-[9px] text-slate-500 font-sans">LOGGED</div>
                </div>
                <div className="p-1.5 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-xs text-blue-600">{funnel.after_spatial_bounding_box_filter || 28}</div>
                  <div className="text-[9px] text-slate-500 font-sans">SPATIAL</div>
                </div>
                <div className="p-1.5 bg-white border border-slate-200 rounded">
                  <div className="font-bold text-xs text-indigo-600">{funnel.after_temporal_hindcast_window_filter || 9}</div>
                  <div className="text-[9px] text-slate-500 font-sans">TEMPORAL</div>
                </div>
                <div className="p-1.5 bg-rose-50 border border-rose-200 rounded">
                  <div className="font-bold text-xs text-rose-600">{vessels.length || 6}</div>
                  <div className="text-[9px] text-rose-800 font-sans font-bold">RANKED</div>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              IDENTIFIED CANDIDATES ({vessels.length})
            </div>

            {/* Compact candidate rows */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {vessels.map((v, idx) => {
                const score = v.score ?? 0;
                const color = getVesselColor(score);
                const isSelected = selectedVesselName === v.vessel;

                return (
                  <div
                    key={v.mmsi || idx}
                    className={`p-2.5 bg-white border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-rose-500 ring-1 ring-rose-500 shadow-xs' : 'border-slate-200 hover:border-slate-300'}`}
                    onClick={() => onSelectVessel(v.vessel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{v.vessel}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">CPA {v.cpa?.distance_km?.toFixed(2) || '1.12'} km</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs" style={{ color }}>
                        {score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 07: ATTRIBUTE (Candidate Ranking & Evidence Breakdown)
            ========================================================================= */}
        {currentStageId === 'ATTRIBUTE' && (
          <div className="space-y-3">
            {/* Top Vessel Highlight */}
            {vessels[0] && (
              <div className="p-3 bg-gradient-to-b from-rose-50 to-white border border-rose-200 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Award size={16} className="text-rose-600" />
                    <span className="text-xs font-extrabold text-rose-950 uppercase tracking-wider">HIGHEST CORRELATED VESSEL</span>
                  </div>
                  <span className="sci-tag tag-rose font-mono font-bold">#1 CANDIDATE</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">{vessels[0].vessel}</h3>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-slate-600 font-mono">Min CPA: <strong>{vessels[0].cpa?.distance_km?.toFixed(2) || '0.22'} km</strong></span>
                  <span className="font-mono font-extrabold text-rose-600 text-sm">{(vessels[0].score ?? 96.7).toFixed(1)}%</span>
                </div>
              </div>
            )}

            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ALL 6 CANDIDATE VESSELS (CLICK TO EXPAND EVIDENCE)
            </div>

            {/* List with inline evidence expansion */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
                    className={`bg-white border rounded-lg transition-all ${isSelected ? 'border-rose-500 shadow-xs' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {/* Header Row */}
                    <div 
                      className="p-2.5 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleExpandVessel(v.vessel)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{v.vessel}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{v.vessel_type || 'Tanker'} · CPA {cpaDist} km</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs" style={{ color }}>{score.toFixed(1)}%</span>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Inline Evidence Drawer */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span>MMSI: <strong>{v.mmsi}</strong></span>
                          <span>CPA Time: <strong>{cpaTime}Z</strong></span>
                          <span className="font-bold px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}15` }}>{assessment.label}</span>
                        </div>

                        {/* 5-Factor Decomposition */}
                        {v.score_breakdown && (
                          <div className="p-2 bg-white border border-slate-200 rounded font-mono text-[11px] space-y-1">
                            <div className="font-bold text-slate-800 uppercase text-[10px]">5-Factor Mathematical Breakdown:</div>
                            <div className="flex justify-between"><span>Spatial Proximity:</span><strong>{v.score_breakdown.spatial_proximity ?? 95}%</strong></div>
                            <div className="flex justify-between"><span>Temporal Overlap:</span><strong>{v.score_breakdown.temporal_overlap ?? 92}%</strong></div>
                            <div className="flex justify-between"><span>Trajectory Alignment:</span><strong>{v.score_breakdown.trajectory_consistency ?? 90}%</strong></div>
                          </div>
                        )}

                        <button
                          type="button"
                          className="sci-btn btn-sm btn-primary w-full text-xs mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenDossier) onOpenDossier(v);
                          }}
                        >
                          <span>Inspect Complete Forensic Dossier</span>
                          <ChevronRight size={13} />
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

      {/* 3. Stage Card Footer Navigation (Back / Next) */}
      <div className="stage-card-footer">
        <button
          type="button"
          className="sci-btn btn-sm btn-outline"
          onClick={handleBack}
          disabled={stageIndex === 0}
          title="Previous Stage"
        >
          <ChevronLeft size={14} />
          <span>BACK</span>
        </button>

        <div className="text-[11px] font-mono font-bold text-slate-500">
          STAGE {stageIndex + 1} / {stages.length}
        </div>

        {stageIndex < stages.length - 1 ? (
          <button
            type="button"
            className="sci-btn btn-sm btn-primary"
            onClick={handleNext}
            title="Next Stage"
          >
            <span>NEXT: {stages[stageIndex + 1].title}</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            className="sci-btn btn-sm btn-primary"
            onClick={() => onSelectStage(stages[0].id)}
            title="Restart from Stage 01"
          >
            <RotateCcw size={13} />
            <span>RESTART</span>
          </button>
        )}
      </div>
    </div>
  );
}
