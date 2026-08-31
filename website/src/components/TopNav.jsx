import { 
  Menu,
  Radar, 
  Satellite, 
  MapPin
} from 'lucide-react';
import { DEMO_CASES } from '../utils/envConstants';

export function TopNav({ 
  activeCaseKey = 'CASE_A',
  onSelectCase,
  onOpenSarModal,
  onOpenDrawer,
  simulationMode,
  onToggleMode
}) {
  const activeCase = DEMO_CASES[activeCaseKey] || DEMO_CASES.CASE_A;

  return (
    <header className="sci-top-nav">
      {/* 1. Hamburger + Brand & Tagline */}
      <div className="sci-brand-section">
        {onOpenDrawer && (
          <button
            type="button"
            className="sci-hamburger-btn"
            onClick={onOpenDrawer}
            title="Open Investigation Workflow Stages Drawer"
            aria-label="Open Navigation Drawer"
          >
            <Menu size={18} className="text-slate-800" />
          </button>
        )}

        <div className="sci-brand-group">
          <div className="sci-logo-circle">
            <Radar className="text-blue-600" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="sci-brand-title">Marine Trace</h1>
              <span className="sci-tag tag-blue">SIH-26143</span>
            </div>
            <p className="sci-brand-subtitle">Satellite Oil Spill Detection & Vessel Attribution</p>
          </div>
        </div>
      </div>

      {/* 2. Case Selector Tabs (BAY OF BENGAL vs ARABIAN SEA) */}
      <div className="sci-case-selector-group" role="tablist" aria-label="Demonstration Cases">
        <button
          role="tab"
          aria-selected={activeCaseKey === 'CASE_A'}
          className={`sci-case-tab-btn ${activeCaseKey === 'CASE_A' ? 'active' : ''}`}
          onClick={() => onSelectCase('CASE_A')}
          title="Switch to Case A: Bay of Bengal (Eastern Coastline)"
        >
          <MapPin size={13} className={activeCaseKey === 'CASE_A' ? 'text-blue-600' : 'text-slate-400'} />
          <span>CASE A — BAY OF BENGAL</span>
        </button>

        <button
          role="tab"
          aria-selected={activeCaseKey === 'CASE_B'}
          className={`sci-case-tab-btn ${activeCaseKey === 'CASE_B' ? 'active' : ''}`}
          onClick={() => onSelectCase('CASE_B')}
          title="Switch to Case B: Arabian Sea (Western Coastline)"
        >
          <MapPin size={13} className={activeCaseKey === 'CASE_B' ? 'text-blue-600' : 'text-slate-400'} />
          <span>CASE B — ARABIAN SEA</span>
        </button>
      </div>

      {/* 3. Incident Telemetry & Mode Controls */}
      <div className="sci-telemetry-row">
        <div className="sci-badge-pill incident-pill">
          <span className="sci-pill-lbl">INCIDENT:</span>
          <span className="sci-pill-val font-mono text-blue-700 font-bold">{activeCase.incidentId || 'DEMO-BOB-001'}</span>
        </div>

        <div className="sci-badge-pill status-pill">
          <span className="sci-pill-lbl">STATUS:</span>
          <span className="sci-pill-val text-emerald-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ONLINE</span>
          </span>
        </div>

        <button 
          type="button"
          className="sci-badge-pill mode-toggle-pill"
          onClick={onToggleMode}
          title="Click to Switch Simulation Mode (Forward vs Hindcast)"
        >
          <span className="sci-pill-lbl">MODE:</span>
          <span className={`sci-pill-val font-mono font-bold ${simulationMode === 'forward' ? 'text-blue-700' : 'text-orange-700'}`}>
            {simulationMode === 'forward' ? 'FORWARD (+24H)' : 'HINDCAST (-12H)'}
          </span>
        </button>
      </div>

      {/* 4. Action Controls */}
      <div className="sci-nav-actions">
        <button 
          type="button"
          className="sci-btn btn-satellite"
          onClick={onOpenSarModal}
          title="Inspect Sentinel-1 SAR Radar Scene"
        >
          <Satellite size={15} />
          <span>SAR Scene</span>
        </button>
      </div>
    </header>
  );
}
