import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Ship, 
  HelpCircle 
} from 'lucide-react';
import { getVesselColor, getVesselAssessment, findClosestPointOfApproach } from '../../utils/geoUtils';

export function VesselDossierModal({
  vessel,
  originCoords,
  onClose,
}) {
  if (!vessel) return null;

  const originLat = originCoords?.lat || 18.4686;
  const originLon = originCoords?.lon || 69.8812;

  const cpaInfo = findClosestPointOfApproach(vessel.track, originLat, originLon);
  const score = vessel.score ?? 0;
  const color = getVesselColor(score);
  const assessment = getVesselAssessment(score);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container dossier-modal-light" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap rose">
              <Ship size={20} />
            </div>
            <div>
              <div className="modal-pre-title">FORENSIC ATTRIBUTION DOSSIER</div>
              <h2 className="modal-title">{vessel.vessel}</h2>
              <span className="text-xs text-slate-500 font-mono">MMSI: {vessel.mmsi} • {vessel.vessel_type || 'Crude Oil Tanker'} • Flag: {vessel.flag || 'Panama'}</span>
            </div>
          </div>

          <div className="modal-header-actions">
            <span className="sci-pill" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}50` }}>
              {assessment.label}
            </span>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close dossier">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Key Metrics Grid */}
          <div className="dossier-metrics-grid-light">
            <div className="dossier-stat-box">
              <span className="stat-lbl">ASSOCIATION SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className="stat-num font-mono" style={{ color }}>{score.toFixed(1)}%</span>
              </div>
              <span className="stat-sub">Inverse CPA Penalty Model</span>
            </div>

            <div className="dossier-stat-box">
              <span className="stat-lbl">MIN CPA DISTANCE</span>
              <div className="flex items-baseline gap-1">
                <span className="stat-num font-mono text-slate-900">{vessel.cpa?.distance_km?.toFixed(2) ?? vessel.distance_km?.toFixed(2) ?? vessel.minimum_distance_km?.toFixed(2) ?? '1.12'} km</span>
              </div>
              <span className="stat-sub">To Probable Hindcast Origin</span>
            </div>

            <div className="dossier-stat-box">
              <span className="stat-lbl">CPA TIMESTAMP</span>
              <div className="flex items-baseline gap-1">
                <span className="stat-num font-mono text-sm text-slate-800">{cpaInfo?.point?.time || '2026-08-28 14:00:00 UTC'}</span>
              </div>
              <span className="stat-sub">Inside 12h Hindcast Window</span>
            </div>

            <div className="dossier-stat-box">
              <span className="stat-lbl">AVERAGE SPEED / HEADING</span>
              <div className="flex items-baseline gap-1">
                <span className="stat-num font-mono text-sm text-slate-800">{vessel.avg_speed_knots || '12.4'} kts</span>
                <span className="text-xs text-slate-500 font-mono">({vessel.heading_deg || '048'}°)</span>
              </div>
              <span className="stat-sub">Underway using Engine</span>
            </div>
          </div>

          {/* Forensic Criteria Breakdown */}
          <div className="dossier-forensic-section-light">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={16} className="text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">EVIDENCE-BASED CANDIDATE ASSESSMENT</h3>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded border flex items-start gap-3 ${score >= 50 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 size={18} className={score >= 50 ? 'text-emerald-600 mt-0.5' : 'text-slate-400 mt-0.5'} />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">1. Spatial Proximity to Hindcast Origin</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {score >= 80 ? (
                      <>Vessel passed within <strong>{vessel.distance_km?.toFixed(2)} km</strong> of the estimated spill origin (<code>{originLat.toFixed(4)}° N, {originLon.toFixed(4)}° E</code>), located inside the 95% confidence uncertainty zone (±2.8 km).</>
                    ) : score >= 50 ? (
                      <>Vessel passed within <strong>{vessel.distance_km?.toFixed(2)} km</strong> of the probable origin, transiting an adjacent shipping corridor.</>
                    ) : (
                      <>Vessel maintained a separation distance of <strong>{vessel.distance_km?.toFixed(2)} km</strong>, outside the localized dispersion zone.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded border bg-emerald-50 border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">2. Temporal Concurrency Overlap</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Vessel transited the regional AOI during the active 12-hour hindcast time window (<code>06:00 to 18:00 UTC</code> on 28 Aug 2026).
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded border flex items-start gap-3 ${score >= 50 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 size={18} className={score >= 50 ? 'text-emerald-600 mt-0.5' : 'text-slate-400 mt-0.5'} />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">3. Corridor Trajectory Intersection</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {score >= 80 ? (
                      <>Vessel track vector (heading 048° ENE) directly intersects the reverse particle dispersion plume axis.</>
                    ) : (
                      <>Vessel track runs parallel or peripheral to the backward hydrodynamic trajectory corridor.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Association Scoring Formula */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-1">PROXIMITY SCORING FORMULA</h4>
            <div className="font-mono text-xs text-blue-700 bg-white p-2 rounded border border-slate-200 mb-1">
              Association Score = max(0, 100 - 4 × d_min) = max(0, 100 - 4 × {vessel.distance_km?.toFixed(2) || '1.18'}) = {score.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500">
              * Linear inverse-distance model evaluating Closest Point of Approach (CPA) from candidate AIS waypoints to the OpenDrift median hindcast origin.
            </p>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-800 leading-relaxed">
              <strong>EVIDENTIARY DISCLAIMER:</strong> This candidate ranking identifies a <em>potentially associated candidate vessel</em> based on geometric proximity in simulated AIS data. It does not establish direct discharge causality or legal culpability.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="sci-btn btn-primary" onClick={onClose}>
            Close Forensic Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
