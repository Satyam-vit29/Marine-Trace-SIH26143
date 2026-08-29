import { Satellite, Compass, Ship } from 'lucide-react';

export function WorkflowIndicator({ currentStageId, onSelectStage }) {
  // Map current stage into the 3 core workflow phases
  const getActivePhase = () => {
    if (['SATELLITE', 'CHARACTERIZE', 'ENVIRONMENT'].includes(currentStageId)) return 'detect';
    if (['FORECAST', 'HINDCAST'].includes(currentStageId)) return 'drift';
    return 'ais';
  };

  const activePhase = getActivePhase();

  return (
    <div className="sci-compact-workflow-bar" aria-label="Investigation Workflow Indicator">
      <div className="sci-workflow-indicator-container">
        <span className="sci-workflow-label">PIPELINE:</span>

        {/* Phase 1: DETECT */}
        <button
          className={`sci-workflow-pill ${activePhase === 'detect' ? 'active' : ''}`}
          onClick={() => onSelectStage('SATELLITE')}
          title="Satellite SAR Slick Detection & Environmental Characterization"
        >
          <Satellite size={13} />
          <span>DETECT</span>
        </button>

        <span className="sci-workflow-divider">→</span>

        {/* Phase 2: DRIFT & ORIGIN */}
        <button
          className={`sci-workflow-pill ${activePhase === 'drift' ? 'active' : ''}`}
          onClick={() => onSelectStage('HINDCAST')}
          title="OpenOil Forward Drift & OpenDrift Backward Hindcast to Probable Origin"
        >
          <Compass size={13} />
          <span>DRIFT & ORIGIN</span>
        </button>

        <span className="sci-workflow-divider">→</span>

        {/* Phase 3: AIS ATTRIBUTION */}
        <button
          className={`sci-workflow-pill ${activePhase === 'ais' ? 'active' : ''}`}
          onClick={() => onSelectStage('ATTRIBUTE')}
          title="AIS Traffic Correlation & Potentially Associated Vessel Ranking"
        >
          <Ship size={13} />
          <span>AIS ATTRIBUTION</span>
        </button>
      </div>
    </div>
  );
}
