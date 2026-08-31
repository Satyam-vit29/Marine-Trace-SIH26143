export function WorkflowIndicator({ 
  currentStageId = 'SATELLITE', 
  stages = [],
  onSelectStage 
}) {
  return (
    <div className="sci-workflow-process-bar" aria-label="Pipeline Workflow Status">
      <div className="sci-workflow-process-track">
        {stages.map((stage, idx) => {
          const isActive = currentStageId === stage.id;
          const num = stage.number || String(idx + 1).padStart(2, '0');

          return (
            <div key={stage.id} className="flex items-center">
              <button
                type="button"
                onClick={() => onSelectStage && onSelectStage(stage.id)}
                className={`sci-workflow-step-indicator ${isActive ? 'active' : ''}`}
                title={`Stage ${num}: ${stage.title} (${stage.subtitle})`}
              >
                <span className="step-num">{num}</span>
                <span className="step-label">{stage.title}</span>
              </button>
              {idx < stages.length - 1 && (
                <span className="sci-workflow-arrow">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
