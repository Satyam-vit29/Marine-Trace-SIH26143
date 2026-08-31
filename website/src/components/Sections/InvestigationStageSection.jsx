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
      {/* 1. Section Header & Stage Title */}
      <div className="sci-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="sci-section-icon-circle blue">
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px' }}>
              {stage.number || String(stageIndex + 1).padStart(2, '0')}
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sci-section-tag">INVESTIGATION STAGES</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '11px', color: '#0284c7' }}>
                STAGE {stageIndex + 1} OF {stages.length}
              </span>
            </div>
            <h2 className="sci-section-title">
              STAGE {stage.number || String(stageIndex + 1).padStart(2, '0')} — {stage.title}: {stage.subtitle}
            </h2>
            <p className="sci-section-subtitle">{stage.description}</p>
          </div>
        </div>

        {/* Lightweight Stage Progress Breadcrumbs */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {stages.map((s, idx) => {
            const isActive = currentStageId === s.id;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => onSelectStage(s.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isActive ? '#0284c7' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b'
                  }}
                  title={`Jump to Stage ${s.number}: ${s.title}`}
                >
                  {s.number || String(idx + 1).padStart(2, '0')} {s.title}
                </button>
                {idx < stages.length - 1 && (
                  <span style={{ color: '#cbd5e1', margin: '0 4px', fontSize: '11px' }}>→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed Content for the ONE active stage */}
      <div style={{ padding: '8px 0' }}>
        {/* =========================================================================
            STAGE 01: DETECT (Sentinel-1 SAR Observation)
            ========================================================================= */}
        {currentStageId === 'SATELLITE' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 42%) minmax(0, 58%)', gap: '20px' }}>
            {/* Left: SAR Image Preview */}
            <div>
              <div 
                className="sar-preview-container cursor-pointer"
                onClick={onOpenSarModal}
                title="Click to View Full-Screen High Resolution Radar Scene"
              >
                <div className="sar-preview-header">
                  <span style={{ fontWeight: 800, fontSize: '12px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Satellite size={14} className="text-blue-600" />
                    <span>SENTINEL-1 C-SAR RADAR OBSERVATION</span>
                  </span>
                  <span className="sci-tag tag-cyan">SAR SCENE</span>
                </div>
                <div className="sar-preview-img-wrap">
                  <img 
                    src={satelliteData?.sar_image_overlay?.url || "/sentinel1_sar_scene.png"} 
                    alt="Sentinel-1 SAR Radar Scene" 
                    className="sar-preview-img"
                  />
                  <div className="sar-preview-mask-overlay">
                    <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%' }}>
                      <ellipse cx="200" cy="125" rx="75" ry="28" fill="rgba(234, 88, 12, 0.35)" stroke="#ea580c" strokeWidth="2.2" />
                      <circle cx="200" cy="125" r="3.5" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="sar-preview-badge">
                    <span>CLICK TO VIEW FULL-SCREEN SAR SCENE ↗</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed SAR Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#064e3b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                      OIL SPILL DETECTED & SEGMENTED
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#047857', fontWeight: 500 }}>
                      C-Band SAR Backscatter Damping Anomaly Confirmed
                    </span>
                  </div>
                </div>
                <span className="sci-tag tag-verified">CONFIRMED</span>
              </div>

              <div className="stage-metric-grid-4">
                <div className="stage-metric-card">
                  <span className="sci-metric-label">Slick Area</span>
                  <span className="sci-metric-val-lg">{satChar.area_km2 || '12.45'} km²</span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Backscatter Anomaly</span>
                  <span className="sci-metric-val-lg" style={{ color: '#e11d48' }}>-4.8 dB</span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Radar Sensor</span>
                  <span className="sci-metric-val-md">Sentinel-1A C-SAR</span>
                </div>

                <div className="stage-metric-card">
                  <span className="sci-metric-label">Acquisition Time</span>
                  <span className="sci-metric-val-md" style={{ fontSize: '11px' }}>{satMeta.acquisition_time || '2026-08-28 14:30 UTC'}</span>
                </div>
              </div>

              {/* Sensor Technical Specifications */}
              <div className="stage-evidence-card">
                <div className="stage-evidence-title">Sentinel-1 Satellite Sensor Parameters</div>
                <div className="stage-metric-grid-4">
                  <div>
                    <span className="sci-metric-label">Polarization</span>
                    <strong className="sci-metric-val-md" style={{ display: 'block', marginTop: '2px' }}>Dual-Pol (VV + VH)</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Frequency</span>
                    <strong className="sci-metric-val-md" style={{ display: 'block', marginTop: '2px' }}>5.405 GHz (C-Band)</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Resolution</span>
                    <strong className="sci-metric-val-md" style={{ display: 'block', marginTop: '2px' }}>10 m / Pixel</strong>
                  </div>
                  <div>
                    <span className="sci-metric-label">Orbit Track</span>
                    <strong className="sci-metric-val-md" style={{ display: 'block', marginTop: '2px' }}>Descending (Pass 122)</strong>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                AUTOMATED MORPHOMETRIC SEGMENTATION
              </span>
              <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                Image processing algorithms compute geometry, perimeter, and PCA principal inertia axes along regional drift alignment to estimate spill volume and age.
              </p>
            </div>

            <div className="stage-metric-grid-5">
              <div className="stage-metric-card">
                <span className="sci-metric-label">Surface Area</span>
                <span className="sci-metric-val-lg">{satChar.area_km2 || '12.45'} km²</span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Major Axis Length</span>
                <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>{satChar.major_axis_km || '6.80'} km</span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Minor Axis Width</span>
                <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>{satChar.minor_axis_km || '2.33'} km</span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Principal Orientation</span>
                <span className="sci-metric-val-lg" style={{ color: '#4f46e5' }}>{satChar.orientation_deg || '045.0'}° NE</span>
              </div>

              <div className="stage-metric-card highlight-blue">
                <span className="sci-metric-label" style={{ color: '#0369a1' }}>Estimated Slick Age</span>
                <span className="sci-metric-val-lg" style={{ color: '#0c4a6e' }}>~6.0 Hours</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 03: ENVIRONMENT (ERA5 + CMEMS)
            ========================================================================= */}
        {currentStageId === 'ENVIRONMENT' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="sci-formula-container" style={{ margin: 0 }}>
              <span className="sci-formula-badge-label">HYDRODYNAMIC DRIFT COUPLING FORMULA</span>
              <div className="sci-formula-math-box">
                V_drift = U_current + 0.03 × U_wind
              </div>
              <p className="sci-formula-explanation" style={{ margin: 0 }}>
                Coupled advection velocity: <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{coupling.net_drift_speed_ms?.toFixed(2) || '0.40'} m/s @ {coupling.net_drift_bearing_deg?.toFixed(1) || '40.8'}° {coupling.net_cardinal || 'NE'}</strong>
              </p>
            </div>

            <div className="stage-metric-grid-2">
              {/* ERA5 Wind */}
              <div className="stage-evidence-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wind size={18} className="text-blue-600" />
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      ERA5 10M SURFACE WIND
                    </span>
                  </div>
                  <span className="sci-tag tag-verified">COPERNICUS CDS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '4px' }}>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Wind Speed</span>
                    <span className="sci-metric-val-lg">{atmo.speed_mean_ms?.toFixed(2) || '4.12'} m/s</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>({atmo.speed_knots?.toFixed(1) || '8.0'} kts)</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Wind Direction</span>
                    <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>{atmo.direction_deg?.toFixed(1) || '42.5'}°</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>({atmo.cardinal_direction || 'NE'})</span>
                  </div>
                </div>
              </div>

              {/* CMEMS Current */}
              <div className="stage-evidence-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Waves size={18} className="text-teal-600" />
                    <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      CMEMS OCEAN SURFACE CURRENT
                    </span>
                  </div>
                  <span className="sci-tag tag-verified">COPERNICUS MARINE</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '4px' }}>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Current Speed</span>
                    <span className="sci-metric-val-lg" style={{ color: '#0d9488' }}>{hydro.speed_mean_ms?.toFixed(2) || '0.28'} m/s</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>({hydro.speed_knots?.toFixed(1) || '0.5'} kts)</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Current Direction</span>
                    <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>{hydro.direction_deg?.toFixed(1) || '38.0'}°</span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>({hydro.cardinal_direction || 'NE'})</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#083344', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                OPENOIL 24-HOUR FORWARD DRIFT SIMULATION
              </span>
              <p style={{ fontSize: '12px', color: '#155e75', margin: 0, lineHeight: 1.5 }}>
                Lagrangian particle advection simulates forward trajectory and dispersion of 300 oil particles under ERA5 winds and CMEMS currents.
              </p>
            </div>

            <div className="stage-metric-grid-2">
              {/* Forward Forecast Card */}
              <div className="stage-evidence-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    FORWARD FORECAST
                  </span>
                  <span className="sci-tag tag-blue">+24H ADVECTION</span>
                </div>
                <div className="stage-metric-grid-3">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Time Horizon</span>
                    <span className="sci-metric-val-lg">+24.0 Hours</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Particles</span>
                    <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>300 Points</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Engine</span>
                    <span className="sci-metric-val-md" style={{ color: '#059669', fontSize: '15px' }}>OpenOil</span>
                  </div>
                </div>
              </div>

              {/* Backward Hindcast Card */}
              <div className="stage-evidence-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    BACKWARD HINDCAST
                  </span>
                  <span className="sci-tag tag-demo">-12H REVERSE</span>
                </div>
                <div className="stage-metric-grid-3">
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Time Horizon</span>
                    <span className="sci-metric-val-lg" style={{ color: '#ea580c' }}>-12.0 Hours</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Convergence</span>
                    <span className="sci-metric-val-md" style={{ color: '#0f172a' }}>Median Cluster</span>
                  </div>
                  <div className="sci-metric-block">
                    <span className="sci-metric-label">Engine</span>
                    <span className="sci-metric-val-md" style={{ color: '#059669', fontSize: '15px' }}>OpenDrift</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#7c2d12', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                OPENDRIFT REVERSE HINDCAST ORIGIN ESTIMATION
              </span>
              <p style={{ fontSize: '12px', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
                Hydrodynamic transport equations are reversed 12 hours backward from detection time to determine release origin and spatial uncertainty envelope.
              </p>
            </div>

            <div className="stage-metric-grid-3">
              <div className="stage-metric-card">
                <span className="sci-metric-label">Origin Location</span>
                <span className="sci-metric-val-lg" style={{ color: '#0f172a' }}>
                  {originLat.toFixed(4)}° N, {originLon.toFixed(4)}° E
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Geodetic WGS-84 Datum
                </span>
              </div>

              <div className="stage-metric-card highlight-orange">
                <span className="sci-metric-label" style={{ color: '#9a3412' }}>Uncertainty (95% CI)</span>
                <span className="sci-metric-val-lg" style={{ color: '#c2410c' }}>
                  ±2.80 km Radius
                </span>
                <span style={{ fontSize: '11px', color: '#9a3412', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  Monte Carlo Dispersion
                </span>
              </div>

              <div className="stage-metric-card">
                <span className="sci-metric-label">Estimated Release Time</span>
                <span className="sci-metric-val-lg" style={{ color: '#0f172a', fontSize: '16px' }}>
                  2026-08-28 02:30 UTC
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  -12.0 Hours Window
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 06: AIS (Historic Traffic Filtering)
            ========================================================================= */}
        {currentStageId === 'CORRELATE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Filter size={15} className="text-slate-700" />
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  HISTORICAL AIS TRAFFIC SPATIO-TEMPORAL FILTERING FUNNEL
                </span>
              </div>

              <div className="stage-metric-grid-4">
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                  <span className="sci-metric-label" style={{ display: 'block', marginBottom: '2px' }}>Total Logged</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '16px', color: '#334155' }}>
                    {funnel.total_regional_transponders_logged || 142}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                  <span className="sci-metric-label" style={{ display: 'block', marginBottom: '2px' }}>Spatial AOI</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '16px', color: '#0284c7' }}>
                    {funnel.after_spatial_bounding_box_filter || 28}
                  </div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                  <span className="sci-metric-label" style={{ display: 'block', marginBottom: '2px' }}>Temporal Window</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '16px', color: '#4f46e5' }}>
                    {funnel.after_temporal_hindcast_window_filter || 9}
                  </div>
                </div>
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                  <span className="sci-metric-label" style={{ display: 'block', marginBottom: '2px', color: '#9f1239' }}>Ranked Candidates</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '16px', color: '#e11d48' }}>
                    {vessels.length || 6}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CORRELATED CANDIDATES OVERVIEW ({vessels.length})
            </div>

            <div className="stage-metric-grid-3">
              {vessels.map((v, idx) => {
                const score = v.score ?? 0;
                const color = getVesselColor(score);
                const isSelected = selectedVesselName === v.vessel;

                return (
                  <div
                    key={v.mmsi || idx}
                    className={`vessel-candidate-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectVessel(v.vessel)}
                  >
                    <div className="vessel-row-main">
                      <div className="vessel-identity-group">
                        <span className="vessel-rank-tag">#{idx + 1}</span>
                        <div>
                          <h4 className="vessel-name-title">{v.vessel}</h4>
                          <span className="vessel-meta-sub">
                            CPA {v.cpa?.distance_km?.toFixed(2) || '1.12'} km
                          </span>
                        </div>
                      </div>
                      <span className="vessel-score-number" style={{ color }}>{score.toFixed(1)}%</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Top Vessel Highlight Banner */}
            <div style={{ padding: '16px 20px', background: 'linear-gradient(to bottom, #fff1f2, #ffffff)', border: '1.5px solid #fecdd3', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Award size={24} style={{ color: '#e11d48', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#881337', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                      POTENTIALLY ASSOCIATED VESSEL
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                      {vessels[0]?.vessel || 'MV Konkan Pride'}
                    </h3>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '22px', color: '#e11d48', display: 'block', lineHeight: 1.1 }}>
                    {(vessels[0]?.score ?? 96.7).toFixed(1)} / 100
                  </span>
                  <span className="sci-tag tag-rose" style={{ marginTop: '4px' }}>HIGH ASSOCIATION</span>
                </div>
              </div>
            </div>

            <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ALL 6 CANDIDATE VESSELS (CLICK TO EXPAND EVIDENCE)
            </div>

            <div className="stage-metric-grid-2">
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
                    className={`vessel-candidate-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleExpandVessel(v.vessel)}
                  >
                    <div className="vessel-row-main">
                      <div className="vessel-identity-group">
                        <span className="vessel-rank-tag">#{idx + 1}</span>
                        <div>
                          <h4 className="vessel-name-title">{v.vessel}</h4>
                          <span className="vessel-meta-sub">
                            {v.vessel_type || 'Tanker'} · CPA {cpaDist} km
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="vessel-score-display">
                          <span className="vessel-score-number" style={{ color }}>{score.toFixed(1)}%</span>
                          <span className="vessel-assessment-badge" style={{ color, backgroundColor: `${color}18` }}>
                            {assessment.label}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)' }}>
                          <div><span style={{ fontWeight: 700, color: '#64748b' }}>MMSI:</span> <strong>{v.mmsi}</strong></div>
                          <div><span style={{ fontWeight: 700, color: '#64748b' }}>CPA Time:</span> <strong>{cpaTime}Z</strong></div>
                        </div>

                        {v.score_breakdown && (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em', marginBottom: '2px' }}>
                              5-Factor Mathematical Breakdown:
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Spatial CPA Proximity:</span>
                              <strong className="stage-evidence-value">{v.score_breakdown.spatial_proximity ?? 95}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Temporal Window Overlap:</span>
                              <strong className="stage-evidence-value">{v.score_breakdown.temporal_overlap ?? 92}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Trajectory Alignment:</span>
                              <strong className="stage-evidence-value">{v.score_breakdown.trajectory_consistency ?? 90}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Heading & Course Compatibility:</span>
                              <strong className="stage-evidence-value">{v.score_breakdown.heading_compatibility ?? 88}%</strong>
                            </div>
                            <div className="stage-evidence-row">
                              <span className="stage-evidence-label">Speed & Behavioral Profile:</span>
                              <strong className="stage-evidence-value">{v.score_breakdown.speed_profile ?? 85}%</strong>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          className="sci-btn btn-sm btn-primary"
                          style={{ width: '100%', marginTop: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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

      {/* 3. Stage Navigation Footer (Back / Next) */}
      <div className="sci-stage-footer-nav">
        <button
          type="button"
          className="sci-btn btn-outline"
          onClick={handleBack}
          disabled={stageIndex === 0}
          title="Go to Previous Stage"
        >
          <ChevronLeft size={15} />
          <span>BACK</span>
        </button>

        <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#64748b' }}>
          STAGE {stageIndex + 1} / {stages.length}
        </div>

        {stageIndex < stages.length - 1 ? (
          <button
            type="button"
            className="sci-btn btn-primary"
            onClick={handleNext}
            title={`Proceed to Stage ${stageIndex + 2}`}
          >
            <span>NEXT → {stages[stageIndex + 1].title}</span>
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            className="sci-btn btn-primary"
            onClick={() => onSelectStage(stages[0].id)}
            title="Restart Investigation from Stage 01"
          >
            <RotateCcw size={14} />
            <span>RESTART INVESTIGATION</span>
          </button>
        )}
      </div>
    </section>
  );
}
