import { 
  Ship, 
  ChevronRight, 
  X, 
  HelpCircle,
  Filter,
  Clock
} from 'lucide-react';
import { getVesselColor, getVesselAssessment } from '../../utils/geoUtils';

export function VesselRankingPanel({
  vessels = [],
  filterFunnel = {
    total_regional_transponders_logged: 142,
    after_spatial_bounding_box_filter: 28,
    after_temporal_hindcast_window_filter: 9,
    high_relevance_candidates_scored: 6
  },
  selectedVesselName,
  onSelectVessel,
  onOpenDossier,
}) {
  return (
    <div className="sci-card vessel-panel">
      {/* Header */}
      <div className="sci-card-header">
        <div className="sci-card-title-group">
          <Ship size={18} className="sci-icon text-rose-600" />
          <h2 className="sci-card-title">CANDIDATE VESSELS</h2>
        </div>
        <span className="sci-tag tag-cyan">SIMULATED AIS — DEMO</span>
      </div>

      <div className="sci-card-body">
        {/* Simple Spatio-Temporal Sifting Summary */}
        <div className="funnel-container">
          <div className="funnel-header">
            <Filter size={14} className="text-slate-700" />
            <span className="font-bold text-xs text-slate-800 tracking-wide">AIS TRAFFIC FILTERING</span>
          </div>

          <div className="funnel-steps-grid">
            <div className="funnel-step">
              <span className="funnel-num font-mono">{filterFunnel.total_regional_transponders_logged || 142}</span>
              <span className="funnel-lbl">LOGGED</span>
            </div>

            <div className="funnel-arrow text-slate-300">→</div>

            <div className="funnel-step">
              <span className="funnel-num font-mono text-blue-600">{filterFunnel.after_spatial_bounding_box_filter || 28}</span>
              <span className="funnel-lbl">SPATIAL</span>
            </div>

            <div className="funnel-arrow text-slate-300">→</div>

            <div className="funnel-step">
              <span className="funnel-num font-mono text-indigo-600">{filterFunnel.after_temporal_hindcast_window_filter || 9}</span>
              <span className="funnel-lbl">TEMPORAL</span>
            </div>

            <div className="funnel-arrow text-slate-300">→</div>

            <div className="funnel-step highlight-step">
              <span className="funnel-num font-mono text-rose-600">{vessels.length || 6}</span>
              <span className="funnel-lbl">RANKED</span>
            </div>
          </div>
        </div>

        {/* Top Potential Associated Vessels List */}
        <div className="candidate-list">
          {vessels.map((vessel, idx) => {
            const isSelected = selectedVesselName === vessel.vessel;
            const score = vessel.score ?? 0;
            const color = getVesselColor(score);
            const assessment = getVesselAssessment(score);
            const cpaTime = vessel.cpa?.time ? vessel.cpa.time.slice(11, 16) : null;

            return (
              <div
                key={vessel.mmsi}
                className={`candidate-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectVessel(vessel.vessel)}
              >
                {/* Top Header */}
                <div className="candidate-header">
                  <div className="flex items-center gap-2.5">
                    <span className="candidate-rank">#{idx + 1}</span>
                    <div>
                      <h3 className="candidate-name">{vessel.vessel}</h3>
                      <span className="text-xs text-slate-500 font-mono">
                        MMSI: {vessel.mmsi} {vessel.imo ? `• IMO: ${vessel.imo}` : ''} • {vessel.vessel_type || 'Tanker'}
                      </span>
                    </div>
                  </div>

                  <div className="candidate-score-box">
                    <span className="score-val font-mono" style={{ color }}>{score.toFixed(1)}%</span>
                    <span className="score-lbl">SCORE</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="candidate-score-track">
                  <div 
                    className="candidate-score-bar"
                    style={{ width: `${Math.max(4, score)}%`, backgroundColor: color }}
                  />
                </div>

                {/* Metrics Footer */}
                <div className="candidate-footer">
                  <div className="candidate-metric">
                    <span className="text-slate-500 font-medium">Min CPA:</span>
                    <span className="font-mono font-extrabold text-slate-900 ml-1 text-xs">
                      {vessel.distance_km?.toFixed(2) ?? vessel.minimum_distance_km?.toFixed(2)} km
                    </span>
                    {cpaTime && (
                      <span className="text-slate-400 font-mono text-[11px] ml-1.5 flex items-center gap-0.5 inline-flex">
                        <Clock size={11} />
                        <span>{cpaTime}Z</span>
                      </span>
                    )}
                  </div>

                  <span className="sci-pill font-mono" style={{ borderColor: `${color}40`, color }}>
                    {assessment.label}
                  </span>
                </div>

                {/* Action Trigger for Selected Vessel */}
                {isSelected && (
                  <div className="candidate-action-row mt-1">
                    <button
                      className="sci-btn btn-dossier"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDossier(vessel);
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Why This Potentially Associated Vessel?</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedVesselName && (
          <button 
            className="sci-btn btn-outline w-full text-xs"
            onClick={() => onSelectVessel(null)}
          >
            <X size={14} />
            <span>Clear Vessel Highlight</span>
          </button>
        )}

        {/* Data Honesty Notice */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed">
          <strong>AIS Source:</strong> Fictional demonstration candidate tracks formatted strictly to <em>MarineCadastre AccessAIS</em> standard schema. Ranked as <strong>Potentially Associated Vessels</strong> based on spatial-temporal proximity to the hindcast origin.
        </div>
      </div>
    </div>
  );
}
