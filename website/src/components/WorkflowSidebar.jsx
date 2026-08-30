import { useState } from 'react';
import {
  Menu,
  X,
  Satellite,
  ScanLine,
  Waves,
  Navigation,
  RotateCcw,
  Ship,
  UserRound,
} from 'lucide-react';

const icons = {
  SATELLITE: Satellite,
  CHARACTERIZE: ScanLine,
  ENVIRONMENT: Waves,
  FORECAST: Navigation,
  HINDCAST: RotateCcw,
  CORRELATE: Ship,
  ATTRIBUTE: UserRound,
};

export function WorkflowSidebar({
  currentStageId,
  onSelectStage,
  stages,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStageClick = (stageId) => {
    onSelectStage(stageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu button */}
      <button
        type="button"
        className={`workflow-menu-toggle ${
          isOpen ? 'is-open' : ''
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle investigation menu"
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {/* Dark overlay */}
      <div
        className={`workflow-sidebar-backdrop ${
          isOpen ? 'is-visible' : ''
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`workflow-sidebar ${
          isOpen ? 'is-open' : ''
        }`}
      >
        {/* Sidebar header */}
        <div className="workflow-sidebar-header">
          <div>
            <div className="workflow-sidebar-kicker">
              MARINE TRACE
            </div>

            <div className="workflow-sidebar-title">
              Investigation Workflow
            </div>
          </div>

          <button
            type="button"
            className="workflow-sidebar-close"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stages */}
        <div className="workflow-sidebar-list">
          {stages.map((stage, index) => {
            const Icon = icons[stage.id] || Satellite;

            const isActive =
              currentStageId === stage.id;

            return (
              <button
                key={stage.id}
                type="button"
                className={`workflow-sidebar-item ${
                  isActive ? 'active' : ''
                }`}
                onClick={() =>
                  handleStageClick(stage.id)
                }
              >
                <div className="workflow-sidebar-icon">
                  <Icon size={17} />
                </div>

                <div className="workflow-sidebar-item-content">
                  <div className="workflow-sidebar-item-top">
                    <span className="workflow-sidebar-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="workflow-sidebar-item-title">
                      {stage.title}
                    </span>
                  </div>

                  <div className="workflow-sidebar-item-subtitle">
                    {stage.subtitle}
                  </div>
                </div>

                {isActive && (
                  <span className="workflow-sidebar-active-dot" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="workflow-sidebar-footer">
          <span className="workflow-sidebar-status-dot" />
          <span>INVESTIGATION ACTIVE</span>
        </div>
      </aside>
    </>
  );
}