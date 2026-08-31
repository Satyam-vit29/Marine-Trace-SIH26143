import { 
  Satellite, 
  Wind, 
  Target, 
  Ship,
  ArrowUpRight
} from 'lucide-react';
import { getVesselColor, getVesselAssessment } from '../../utils/geoUtils';

export function IncidentOverviewPanel({
  satelliteData,
  forcingData,
  originData,
  aisData,
  simulationMode = 'forward',
  selectedVesselName,
  onSelectVessel,
  onOpenSarModal,
}) {
  const incidentId = satelliteData?.incident_id || satelliteData?.satellite_metadata?.incident_id || aisData?.incident_id || 'DEMO-BOB-001';
  const satMeta = satelliteData?.satellite_metadata || {};
  const satChar = satelliteData?.slick_characterization || {};
  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};
  const origin = originData?.probable_origin || { lat: 16.3820, lon: 82.6180 };
  const vessels = Array.isArray(aisData?.vessels) 
    ? aisData.vessels 
    : (Array.isArray(aisData?.ranked_vessels) ? aisData.ranked_vessels : []);

  return (
    <div className="sci-incident-overview-panel">
      {/* Panel Header */}
      <div className="overview-panel-header">
        <div className="flex items-center gap-2">
          <span className="overview-panel-title">INCIDENT OVERVIEW</span>
          <span className="sci-tag tag-verified font-mono text-[9px] font-bold">LIVE TELEMETRY</span>
        </div>
        <span className="text-[11px] font-mono text-slate-600 font-bold tracking-tight">
          {incidentId}
        </span>
      </div>

      {/* Panel Body */}
      <div className="overview-panel-body">
        {/* Block 1: Spill Detected */}
        <div className="overview-section-box">
          <div className="overview-section-title-row">
            <div className="flex items-center gap-1.5">
              <Satellite size={14} className="text-blue-600" />
              <h3 className="overview-heading-text">1. SPILL DETECTED</h3>
            </div>
            <span className="sci-tag tag-blue text-[9px] font-bold">SENTINEL-1 C-SAR</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="sci-metric-block">
              <span className="sci-metric-label">Slick Area</span>
              <span className="sci-metric-val-lg text-slate-900 font-bold font-mono">
                {satChar.area_km2 || '12.45'} <span className="text-xs font-normal text-slate-500">km²</span>
              </span>
            </div>
            <div className="sci-metric-block">
              <span className="sci-metric-label">Acquisition Time</span>
              <span className="sci-metric-val-md font-mono text-slate-800 text-xs font-semibold">
                {satMeta.acquisition_time || '2026-08-28 14:30 UTC'}
              </span>
            </div>
          </div>

          <div className="overview-metric-footer">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Anomaly:</span>
              <span className="sci-metric-val-danger font-mono font-bold">-4.8 dB Damping</span>
            </div>
            {onOpenSarModal && (
              <button 
                type="button" 
                className="overview-quick-link flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold"
                onClick={onOpenSarModal}
              >
                <span>View SAR Scene</span>
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Block 2: Drift Forcing */}
        <div className="overview-section-box">
          <div className="overview-section-title-row">
            <div className="flex items-center gap-1.5">
              <Wind size={14} className="text-blue-600" />
              <h3 className="overview-heading-text">2. DRIFT FORCING</h3>
            </div>
            <span className="sci-tag tag-cyan text-[9px] font-bold">ERA5 + CMEMS</span>
          </div>

          <div className="drift-datasets-grid mt-2">
            {/* ERA5 Wind */}
            <div className="drift-dataset-card">
              <div className="drift-dataset-title text-[11px] font-bold text-slate-700">ERA5 10m Surface Wind</div>
              <div className="drift-data-row">
                <span className="drift-data-label">Speed:</span>
                <span className="drift-data-value font-mono font-bold">{atmo.speed_mean_ms?.toFixed(2) || '4.12'} m/s</span>
              </div>
              <div className="drift-data-row">
                <span className="drift-data-label">Direction:</span>
                <span className="drift-data-value font-mono">{atmo.direction_deg?.toFixed(1) || '42.5'}° {atmo.cardinal_direction || 'NE'}</span>
              </div>
            </div>

            {/* CMEMS Current */}
            <div className="drift-dataset-card">
              <div className="drift-dataset-title text-[11px] font-bold text-slate-700">CMEMS Ocean Current</div>
              <div className="drift-data-row">
                <span className="drift-data-label">Speed:</span>
                <span className="drift-data-value font-mono font-bold text-teal-700">{hydro.speed_mean_ms?.toFixed(2) || '0.28'} m/s</span>
              </div>
              <div className="drift-data-row">
                <span className="drift-data-label">Direction:</span>
                <span className="drift-data-value font-mono">{hydro.direction_deg?.toFixed(1) || '38.0'}° {hydro.cardinal_direction || 'NE'}</span>
              </div>
            </div>
          </div>

          <div className="overview-metric-footer">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Model:</span>
              <span className="font-mono font-bold text-slate-800">OpenOil / OpenDrift</span>
            </div>
            <span className={`font-mono text-xs font-bold ${simulationMode === 'forward' ? 'text-blue-700' : 'text-orange-700'}`}>
              {simulationMode === 'forward' ? 'Forward (+24h)' : 'Hindcast (-12h)'}
            </span>
          </div>
        </div>

        {/* Block 3: Probable Origin */}
        <div className="overview-section-box">
          <div className="overview-section-title-row">
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-orange-600" />
              <h3 className="overview-heading-text">3. PROBABLE ORIGIN</h3>
            </div>
            <span className="sci-tag tag-demo text-[9px] font-bold">-12H HINDCAST</span>
          </div>

          <div className="origin-data-table mt-2">
            <div className="origin-data-row">
              <span className="origin-data-label">Location:</span>
              <span className="origin-data-value font-mono font-bold text-slate-900">
                {origin.lat?.toFixed(4)}° N, {origin.lon?.toFixed(4)}° E
              </span>
            </div>
            <div className="origin-data-row">
              <span className="origin-data-label">Uncertainty:</span>
              <span className="origin-data-value highlight font-mono font-bold text-orange-700">
                ±2.80 km (95% CI)
              </span>
            </div>
            <div className="origin-data-row">
              <span className="origin-data-label">Estimated Release:</span>
              <span className="origin-data-value font-mono text-xs text-slate-700">
                2026-08-28 02:30:00 UTC
              </span>
            </div>
          </div>
        </div>

        {/* Block 4: Candidate Vessels (All 6 Candidates with Progress Bars) */}
        <div className="overview-section-box">
          <div className="overview-section-title-row">
            <div className="flex items-center gap-1.5">
              <Ship size={14} className="text-rose-600" />
              <h3 className="overview-heading-text">4. CANDIDATE VESSELS ({vessels.length})</h3>
            </div>
            <span className="sci-tag tag-rose text-[9px] font-bold">AIS ATTRIBUTION</span>
          </div>

          <div className="overview-vessel-list mt-2">
            {vessels.map((v, idx) => {
              const score = typeof v.score === 'number' 
                ? v.score 
                : (typeof v.association_score === 'number' ? v.association_score : 0);
              const color = getVesselColor(score);
              const assessment = v.association_label || getVesselAssessment(score).label;
              const isSelected = selectedVesselName === v.vessel;
              const cpaDist = v.cpa?.distance_km != null 
                ? `${v.cpa.distance_km.toFixed(2)} km` 
                : (v.distance_km != null ? `${v.distance_km.toFixed(2)} km` : 'N/A');
              const vesselType = v.vessel_type || v.type || 'Tanker';

              return (
                <div
                  key={v.mmsi || v.vessel || idx}
                  className={`overview-vessel-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectVessel && onSelectVessel(v.vessel)}
                  title={`Click to focus map camera on ${v.vessel}`}
                >
                  <div className="overview-vessel-top-row">
                    <div className="overview-vessel-id-wrap">
                      <span className="overview-vessel-rank">#{idx + 1}</span>
                      <h4 className="overview-vessel-name">{v.vessel}</h4>
                    </div>
                    <span className="overview-vessel-score font-mono font-extrabold text-xs" style={{ color }}>
                      {score.toFixed(1)}%
                    </span>
                  </div>

                  {/* Association Score Track Bar */}
                  <div className="overview-vessel-bar-track">
                    <div 
                      className="overview-vessel-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(5, score))}%`, backgroundColor: color }}
                    />
                  </div>

                  <div className="overview-vessel-mid-row text-[11px] text-slate-500">
                    <span>{vesselType}</span>
                    <span>•</span>
                    <span>CPA <strong>{cpaDist}</strong></span>
                  </div>

                  <div className="overview-vessel-bot-row">
                    <span
                      className="overview-vessel-badge"
                      style={{ color, backgroundColor: `${color}14`, borderColor: `${color}35` }}
                    >
                      {assessment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

