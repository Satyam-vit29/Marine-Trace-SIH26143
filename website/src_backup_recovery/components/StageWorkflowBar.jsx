import { 
  Satellite, 
  Ruler, 
  Waves, 
  Wind, 
  RotateCcw, 
  Ship, 
  Award 
} from 'lucide-react';

const DEFAULT_STAGES = [
  { id: 'SATELLITE', num: '01', title: 'DETECT', sub: 'Sentinel-1 SAR', icon: <Satellite size={16} /> },
  { id: 'CHARACTERIZE', num: '02', title: 'CHARACTERIZE', sub: 'Slick Geometry', icon: <Ruler size={16} /> },
  { id: 'ENVIRONMENT', num: '03', title: 'ENVIRONMENT', sub: 'ERA5 + CMEMS', icon: <Waves size={16} /> },
  { id: 'FORECAST', num: '04', title: 'DRIFT', sub: 'Forward Forecast', icon: <Wind size={16} /> },
  { id: 'HINDCAST', num: '05', title: 'ORIGIN', sub: 'Backward Hindcast', icon: <RotateCcw size={16} /> },
  { id: 'CORRELATE', num: '06', title: 'AIS', sub: 'Historic Traffic', icon: <Ship size={16} /> },
  { id: 'ATTRIBUTE', num: '07', title: 'ATTRIBUTE', sub: 'Candidate Ranking', icon: <Award size={16} /> }
];

export function StageWorkflowBar({ currentStageId, onSelectStage, stages = DEFAULT_STAGES }) {
  return (
    <nav className="sci-workflow-stepper-bar" aria-label="Investigation Workflow Steps">
      <div className="sci-stepper-track">
        {stages.map((stage) => {
          const isActive = currentStageId === stage.id;
          const icon = stage.icon || DEFAULT_STAGES.find(s => s.id === stage.id)?.icon || <Satellite size={16} />;
          const num = stage.num || stage.number || '01';
          const sub = stage.sub || stage.subtitle || 'Step';

          return (
            <button
              key={stage.id}
              className={`sci-step-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStage(stage.id)}
              title={`${num} ${stage.title} — ${sub}`}
            >
              <div className="sci-step-icon-wrap">
                {icon}
              </div>
              <div className="sci-step-text-group">
                <div className="flex items-center gap-1">
                  <span className="sci-step-idx">{num}</span>
                  <span className="sci-step-title">{stage.title}</span>
                </div>
                <span className="sci-step-sub">{sub}</span>
              </div>
              {isActive && <div className="sci-active-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
