import { 
  Satellite, 
  Wind, 
  Target, 
  Ship
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
        <span className="text-[11px] font-mono text-slate-600 font-bold">
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
            <div className="sci-metric-block">
              <span className="sci-metric-label">Slick Area</span>
              <span className="sci-metric-val-lg">{satChar.area_km2 || '12.45'} km²</span>
            </div>
            <div className="sci-metric-block">
              <span className="sci-metric-label">Acquisition Time</span>
              <span className="sci-metric-val-md">{satMeta.acquisition_time || '2026-08-28 14:30 UTC'}</span>
            </div>
          </div>

          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#64748b', marginRight: '6px' }}>Anomaly:</span>
              <span className="sci-metric-val-danger">-4.8 dB Damping</span>
            </div>
            {onOpenSarModal && (
              <button 
                type="button" 
                style={{ color: '#0284c7', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px' }}
                onClick={onOpenSarModal}
              >
                View SAR Scene ↗
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

          <div className="drift-datasets-grid">
            {/* ERA5 Wind */}
            <div className="drift-dataset-card">
              <div className="drift-dataset-title">ERA5 10m Surface Wind</div>
              <div className="drift-data-row">
                <span className="drift-data-label">Speed:</span>
                <span className="drift-data-value">{atmo.speed_mean_ms?.toFixed(2) || '4.12'} m/s</span>
              </div>
              <div className="drift-data-row">
                <span className="drift-data-label">Direction:</span>
                <span className="drift-data-value">{atmo.direction_deg?.toFixed(1) || '42.5'}° {atmo.cardinal_direction || 'NE'}</span>
              </div>
            </div>

            {/* CMEMS Current */}
            <div className="drift-dataset-card">
              <div className="drift-dataset-title">CMEMS Ocean Current</div>
              <div className="drift-data-row">
                <span className="drift-data-label">Speed:</span>
                <span className="drift-data-value">{hydro.speed_mean_ms?.toFixed(2) || '0.28'} m/s</span>
              </div>
              <div className="drift-data-row">
                <span className="drift-data-label">Direction:</span>
                <span className="drift-data-value">{hydro.direction_deg?.toFixed(1) || '38.0'}° {hydro.cardinal_direction || 'NE'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#64748b', marginRight: '6px' }}>Model:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#1e293b' }}>OpenOil / OpenDrift</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
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

          <div className="origin-data-table">
            <div className="origin-data-row">
              <span className="origin-data-label">Location:</span>
              <span className="origin-data-value">
                {origin.lat?.toFixed(4)}° N, {origin.lon?.toFixed(4)}° E
              </span>
            </div>
            <div className="origin-data-row">
              <span className="origin-data-label">Uncertainty:</span>
              <span className="origin-data-value highlight">
                ±2.80 km (95% CI)
              </span>
            </div>
            <div className="origin-data-row">
              <span className="origin-data-label">Estimated Release:</span>
              <span className="origin-data-value" style={{ fontSize: '11px' }}>
                2026-08-28 02:30:00 UTC
              </span>
            </div>
          </div>
        </div>

        {/* Block 4: Candidate Vessels (All 6 Candidates) */}
        <div className="overview-section-box">
          <div className="overview-section-title-row">
            <div className="flex items-center gap-1.5">
              <Ship size={14} className="text-rose-600" />
              <h3 className="overview-heading-text">4. CANDIDATE VESSELS ({vessels.length})</h3>
            </div>
            <span className="sci-tag tag-rose text-[9px] font-bold">AIS ATTRIBUTION</span>
          </div>

          <div className="overview-vessel-list">
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
                >
                  <div className="overview-vessel-top-row">
                    <div className="overview-vessel-id-wrap">
                      <span className="overview-vessel-rank">#{idx + 1}</span>
                      <h4 className="overview-vessel-name">{v.vessel}</h4>
                    </div>
                    <span className="overview-vessel-score" style={{ color }}>
                      {score.toFixed(1)} / 100
                    </span>
                  </div>

                  <div className="overview-vessel-mid-row">
                    {vesselType} · CPA {cpaDist}
                  </div>

                  <div className="overview-vessel-bot-row">
                    <span
                      className="overview-vessel-badge"
                      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}35` }}
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
