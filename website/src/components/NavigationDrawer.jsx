import { 
  Satellite, 
  Ruler, 
  Waves, 
  Wind, 
  RotateCcw, 
  Ship, 
  Award,
  X,
  ChevronRight
} from 'lucide-react';

const STAGE_ICONS = {
  SATELLITE: <Satellite size={16} />,
  CHARACTERIZE: <Ruler size={16} />,
  ENVIRONMENT: <Waves size={16} />,
  FORECAST: <Wind size={16} />,
  HINDCAST: <RotateCcw size={16} />,
  CORRELATE: <Ship size={16} />,
  ATTRIBUTE: <Award size={16} />,
};

export function NavigationDrawer({
  isOpen,
  onClose,
  currentStageId = 'SATELLITE',
  onSelectStage,
  stages = []
}) {
  if (!isOpen) return null;

  const handleStageClick = (stageId) => {
    onSelectStage(stageId);
    onClose();
    setTimeout(() => {
      const el = document.getElementById('investigation-stages');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="sci-drawer-backdrop" onClick={onClose}>
      <aside 
        className="sci-drawer-content" 
        onClick={(e) => e.stopPropagation()}
        aria-label="Investigation Stages Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="sci-drawer-header">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
              WORKFLOW PIPELINE
            </span>
            <h2 className="text-sm font-extrabold text-slate-900">
              Investigation Stages
            </h2>
          </div>
          <button 
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            onClick={onClose}
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Stages List */}
        <nav className="sci-drawer-list">
          {stages.map((stage, idx) => {
            const isActive = currentStageId === stage.id;
            const icon = STAGE_ICONS[stage.id] || <Satellite size={16} />;
            const num = stage.number || String(idx + 1).padStart(2, '0');

            return (
              <button
                key={stage.id}
                type="button"
                className={`sci-drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => handleStageClick(stage.id)}
              >
                <div className="sci-drawer-item-icon">
                  {icon}
                </div>
                <div className="sci-drawer-item-text">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600">{num}</span>
                    <span className="font-bold text-xs text-slate-900">{stage.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{stage.subtitle}</span>
                </div>
                <ChevronRight size={14} className={`ml-auto ${isActive ? 'text-blue-600' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer Notice */}
        <div className="sci-drawer-footer">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
            <strong>Sequential Forensic Analysis:</strong> Move through stages 01 to 07 to investigate satellite imagery, oceanographic drift, backward origin, and candidate vessel attribution.
          </div>
        </div>
      </aside>
    </div>
  );
}
