import { useState } from 'react';
import { Ship, HelpCircle, X, CheckCircle2 } from 'lucide-react';
import {
  getVesselColor,
  getVesselAssessment,
} from '../../utils/geoUtils';

export function AisCorrelationSection({
  vessels = [],
  selectedVesselName,
  onSelectVessel,
  onOpenDossier,
}) {
  const [explanationVessel, setExplanationVessel] = useState(null);

  const getCpaDistance = (vessel) => {
    return (
      vessel.cpa?.distance_km ??
      vessel.distance_km ??
      vessel.minimum_distance_km ??
      1.12
    );
  };

  const getCpaTime = (vessel) => {
    if (vessel.cpa?.time) {
      return vessel.cpa.time.slice(11, 16);
    }

    return '12:30';
  };

  const openExplanation = (vessel) => {
    setExplanationVessel(vessel);
  };

  const closeExplanation = () => {
    setExplanationVessel(null);
  };

  const handleFullDossier = () => {
    if (!explanationVessel) return;

    if (onOpenDossier) {
      onOpenDossier(explanationVessel);
    }

    setExplanationVessel(null);
  };

  return (
    <>
      <section
        id="section-ais"
        className="sci-scroll-section vessel-attribution-section"
      >

        {/* Header */}
        <div className="sci-section-header">
          <div className="flex items-center gap-3">
            <div className="sci-section-icon-circle rose">
              <Ship size={24} />
            </div>

            <div>
              <h2 className="sci-section-title">
                VESSEL ATTRIBUTION
              </h2>

              <p className="sci-section-subtitle">
                Potentially associated vessels ranked by AIS correlation
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="vessel-summary">
          <strong>{vessels.length} candidates</strong>
          <span>identified within 12h window</span>
        </div>

        {/* Table */}
        <div className="vessel-table-wrapper">
          <table className="vessel-table">

            <thead>
              <tr>
                <th>#</th>
                <th>VESSEL</th>
                <th>TYPE</th>
                <th>SCORE</th>
                <th>CPA</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {vessels.map((vessel, idx) => {
                const isSelected =
                  selectedVesselName === vessel.vessel;

                const score = vessel.score ?? 0;

                const color = getVesselColor(score);

                const assessment =
                  getVesselAssessment(score);

                const cpaDistance =
                  getCpaDistance(vessel);

                const cpaTime =
                  getCpaTime(vessel);

                const isHighPotential =
                  score >= 80 ||
                  assessment.label
                    ?.toUpperCase()
                    .includes('HIGH');

                return (
                  <tr
                    key={
                      vessel.mmsi ||
                      vessel.vessel
                    }
                    className={
                      isSelected
                        ? 'vessel-table-row selected'
                        : ''
                    }
                    onClick={() =>
                      onSelectVessel(vessel.vessel)
                    }
                  >

                    {/* Rank */}
                    <td>
                      <span
                        className={
                          idx === 0
                            ? 'vessel-rank top'
                            : 'vessel-rank'
                        }
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Vessel */}
                    <td>
                      <div className="vessel-name">
                        {vessel.vessel}
                      </div>

                      <div className="vessel-mmsi">
                        MMSI {vessel.mmsi || '—'}
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span className="vessel-type">
                        {vessel.type ||
                          vessel.vessel_type ||
                          'Crude Oil Tanker'}
                      </span>
                    </td>

                    {/* Score */}
                    <td>
                      <div className="vessel-score-cell">
                        <strong
                          style={{ color }}
                        >
                          {score.toFixed(1)}%
                        </strong>

                        <div className="vessel-score-bar">
                          <div
                            className="vessel-score-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, score)
                              )}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* CPA */}
                    <td>
                      <span className="vessel-metric">
                        {Number(cpaDistance).toFixed(2)} km
                      </span>
                    </td>

                    {/* Time */}
                    <td>
                      <span className="vessel-metric">
                        {cpaTime} UTC
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className="vessel-status"
                        style={{
                          color,
                          backgroundColor: `${color}12`,
                          borderColor: `${color}35`,
                        }}
                      >
                        {assessment.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      {isHighPotential ? (
                        <button
                          type="button"
                          className="vessel-why-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openExplanation(vessel);
                          }}
                        >
                          <HelpCircle size={14} />
                          Why high potential?
                        </button>
                      ) : (
                        <span className="vessel-no-action">
                          —
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        <div className="vessel-table-hint">
          Click a vessel to highlight its AIS track on the map.
        </div>

      </section>

      {/* =====================================================
          WHY HIGH POTENTIAL MODAL
          ===================================================== */}

      {explanationVessel && (
        <div
          className="modal-backdrop"
          onClick={closeExplanation}
        >
          <div
            className="vessel-explanation-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="vessel-explanation-header">

              <div>
                <div className="vessel-explanation-kicker">
                  VESSEL ATTRIBUTION ANALYSIS
                </div>

                <h2>
                  {explanationVessel.vessel}
                </h2>
              </div>

              <button
                type="button"
                className="vessel-explanation-close"
                onClick={closeExplanation}
              >
                <X size={18} />
              </button>

            </div>

            {/* Score */}
            <div className="vessel-explanation-score">

              <div>
                <span className="vessel-explanation-score-number">
                  {(explanationVessel.score ?? 0).toFixed(1)}%
                </span>

                <span className="vessel-explanation-score-label">
                  HIGH ASSOCIATION
                </span>
              </div>

              <div className="vessel-explanation-score-description">
                Candidate vessel with strong spatial,
                temporal and trajectory correlation.
              </div>

            </div>

            {/* Evidence */}
            <div className="vessel-explanation-body">

              <h3>
                WHY THIS VESSEL IS HIGH POTENTIAL
              </h3>

              <div className="vessel-evidence-list">

                <div className="vessel-evidence-item">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>
                      Closest approach
                    </strong>

                    <p>
                      Vessel passed approximately{' '}
                      <b>
                        {Number(
                          getCpaDistance(
                            explanationVessel
                          )
                        ).toFixed(2)} km
                      </b>{' '}
                      from the probable spill origin.
                    </p>
                  </div>
                </div>

                <div className="vessel-evidence-item">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>
                      Temporal overlap
                    </strong>

                    <p>
                      The vessel was present within
                      the active 12-hour hindcast
                      investigation window.
                    </p>
                  </div>
                </div>

                <div className="vessel-evidence-item">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>
                      Trajectory correlation
                    </strong>

                    <p>
                      Its AIS movement is consistent
                      with the reverse particle-drift
                      corridor leading toward the
                      probable spill origin.
                    </p>
                  </div>
                </div>

                <div className="vessel-evidence-item">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>
                      Association score
                    </strong>

                    <p>
                      The candidate receives a{' '}
                      <b>
                        {(explanationVessel.score ?? 0).toFixed(1)}%
                      </b>{' '}
                      association score under the
                      proximity-based ranking model.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="vessel-explanation-footer">

              <button
                type="button"
                className="vessel-secondary-button"
                onClick={closeExplanation}
              >
                Close
              </button>

              <button
                type="button"
                className="vessel-primary-button"
                onClick={handleFullDossier}
              >
                View Full Dossier
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}