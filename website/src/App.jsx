import { useState, useEffect, useCallback, useMemo } from 'react';
import { TopNav } from './components/TopNav';
import { NavigationDrawer } from './components/NavigationDrawer';
import { TacticalMap } from './components/TacticalMap/TacticalMap';
import { SimulationTimeline } from './components/Timeline/SimulationTimeline';
import { IncidentOverviewPanel } from './components/Panels/IncidentOverviewPanel';
import { InvestigationStageSection } from './components/Sections/InvestigationStageSection';
import { DataProvenanceSection } from './components/Sections/DataProvenanceSection';
import { VesselDossierModal } from './components/Panels/VesselDossierModal';
import { SatelliteSarModal } from './components/Panels/SatelliteSarModal';
import { DataProvenanceModal } from './components/Panels/DataProvenanceModal';

import { DEMO_CASES, getWorkflowStages } from './utils/envConstants';
import { Radar, AlertCircle } from 'lucide-react';
import './App.css';

export function App() {
  // 1. Active Case Demonstration State (Default: CASE_A — Bay of Bengal)
  const [activeCaseKey, setActiveCaseKey] = useState('CASE_A');
  const activeCase = DEMO_CASES[activeCaseKey] || DEMO_CASES.CASE_A;

  // 2. Scientific Data States
  const [satelliteData, setSatelliteData] = useState(null);
  const [forcingData, setForcingData] = useState(null);
  const [forwardData, setForwardData] = useState(null);
  const [backwardData, setBackwardData] = useState(null);
  const [originData, setOriginData] = useState(null);
  const [aisData, setAisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // 3. Active Stage & Navigation Drawer
  const [currentStageId, setCurrentStageId] = useState('SATELLITE');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 4. Simulation Mode & Playback State
  const [simulationMode, setSimulationMode] = useState('forward'); // 'forward' | 'backward'
  const [timeIndex, setTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 5. Map Layer Visibility
  const [layers, setLayers] = useState({
    sarImage: true,
    satellite: true,
    spill: true,
    forward: true,
    backward: false,
    origin: true,
    currents: true,
    wind: true,
    vessels: false,
  });

  // 6. Modals & Vessel Selection
  const [selectedVesselName, setSelectedVesselName] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSarModalOpen, setIsSarModalOpen] = useState(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);

  // 7. Dynamic Workflow Stages for active case
  const workflowStages = useMemo(() => {
    return getWorkflowStages(activeCaseKey);
  }, [activeCaseKey]);

  // 8. Camera States (derived from active case default center)
  const [mapCenter, setMapCenter] = useState(activeCase.defaultCenter);
  const [mapZoom, setMapZoom] = useState(activeCase.defaultZoom);

  // Fetch or retrieve datasets whenever activeCaseKey changes
  useEffect(() => {
    let isMounted = true;
    const targetCase = DEMO_CASES[activeCaseKey] || DEMO_CASES.CASE_A;

    // Check embedded memory first (for single-file standalone demo mode)
    if (window.__EMBEDDED_DATA__) {
      const embeddedCase = window.__EMBEDDED_DATA__[activeCaseKey] || window.__EMBEDDED_DATA__.cases?.[activeCaseKey] || (activeCaseKey === 'CASE_A' ? window.__EMBEDDED_DATA__ : null);
      if (embeddedCase && embeddedCase.satellite) {
        Promise.resolve().then(() => {
          if (!isMounted) return;
          setSatelliteData(embeddedCase.satellite || null);
          setForcingData(embeddedCase.forcing || null);
          setForwardData(embeddedCase.forward || null);
          setBackwardData(embeddedCase.backward || null);
          setOriginData(embeddedCase.origin || null);
          setAisData(embeddedCase.ais || null);
          setIsLoading(false);
        });
        return;
      }
    }

    // Dynamic fetch from case data directory
    const dataPath = targetCase.dataPath;
    Promise.all([
      fetch(`${dataPath}/satellite_detection.json`)
        .then((r) => (r.ok ? r.json() : fetch('/satellite_detection.json').then((res) => res.json())))
        .catch(() => null),
      fetch(`${dataPath}/environmental_forcing.json`)
        .then((r) => (r.ok ? r.json() : fetch('/environmental_forcing.json').then((res) => res.json())))
        .catch(() => null),
      fetch(`${dataPath}/trajectory.json`)
        .then((r) => (r.ok ? r.json() : fetch('/trajectory.json').then((res) => res.json())))
        .catch(() => null),
      fetch(`${dataPath}/backward_trajectory.json`)
        .then((r) => (r.ok ? r.json() : fetch('/backward_trajectory.json').then((res) => res.json())))
        .catch(() => null),
      fetch(`${dataPath}/origin.json`)
        .then((r) => (r.ok ? r.json() : fetch('/origin.json').then((res) => res.json())))
        .catch(() => null),
      fetch(`${dataPath}/ais_web.json`)
        .then((r) => (r.ok ? r.json() : fetch('/ais_web.json').then((res) => res.json())))
        .catch(() => null),
    ])
      .then(([sat, forcing, fwd, bwd, orig, ais]) => {
        if (!isMounted) return;
        setSatelliteData(sat);
        setForcingData(forcing);
        setForwardData(fwd);
        setBackwardData(bwd);
        setOriginData(orig);
        setAisData(ais);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(`Error loading dataset for ${activeCaseKey}:`, err);
        setDataError(err?.message || 'Failed to load case data');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCaseKey]);

  // Case switch handler
  const handleSelectCase = useCallback((newCaseKey) => {
    if (newCaseKey === activeCaseKey) return;
    const targetCase = DEMO_CASES[newCaseKey] || DEMO_CASES.CASE_A;
    setActiveCaseKey(newCaseKey);
    setSelectedVesselName(null);
    setCurrentStageId('SATELLITE');
    setSimulationMode('forward');
    setTimeIndex(0);
    setIsPlaying(false);
    setMapCenter(targetCase.defaultCenter);
    setMapZoom(targetCase.defaultZoom);
    setLayers({
      sarImage: true,
      satellite: true,
      spill: true,
      forward: true,
      backward: false,
      origin: true,
      currents: true,
      wind: true,
      vessels: false,
    });
  }, [activeCaseKey]);

  // Compute maximum steps for current mode
  const maxSteps = useMemo(() => {
    if (simulationMode === 'forward') {
      return (forwardData?.latitude?.[0]?.length || 145) - 1;
    }
    return (backwardData?.latitude?.[0]?.length || 73) - 1;
  }, [simulationMode, forwardData, backwardData]);

  // Stage selection handler
  const handleStageSelect = useCallback((stageId) => {
    setCurrentStageId(stageId);
    const stage = workflowStages.find((s) => s.id === stageId);
    if (!stage) return;

    // Apply stage layers
    if (stage.layers) {
      setLayers((prev) => ({
        ...prev,
        ...stage.layers,
      }));
    }

    // Apply stage mode
    if (stage.mode) {
      setSimulationMode(stage.mode);
      setTimeIndex(0);
      setIsPlaying(false);
    }

    // Apply camera focus
    if (stage.center && stage.zoom) {
      setMapCenter(stage.center);
      setMapZoom(stage.zoom);
    }

    // Auto-select candidate vessel for Stage 07
    if (stageId === 'ATTRIBUTE' && stage.highlightVessel) {
      setSelectedVesselName(stage.highlightVessel);
    }
  }, [workflowStages]);

  // Mode change handler (Forward vs Backward)
  const handleModeChange = useCallback((mode) => {
    setSimulationMode(mode);
    setTimeIndex(0);
    setIsPlaying(false);
    if (mode === 'forward') {
      setLayers((prev) => ({ ...prev, forward: true, backward: false }));
    } else {
      setLayers((prev) => ({ ...prev, forward: false, backward: true, origin: true }));
    }
  }, []);

  // Layer toggle handler
  const handleToggleLayer = useCallback((layerKey) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  }, []);

  // Vessel selection handler
  const handleSelectVessel = useCallback((vesselName) => {
    setSelectedVesselName(vesselName);
    if (vesselName && Array.isArray(aisData?.vessels)) {
      const vessel = aisData.vessels.find((v) => v && (v.vessel === vesselName || (typeof v.vessel === 'string' && (v.vessel.includes(vesselName) || vesselName.includes(v.vessel)))));
      if (vessel && Array.isArray(vessel.track) && vessel.track.length > 0) {
        const validTrack = vessel.track.filter((pt) => pt && pt.lat != null && pt.lon != null);
        if (validTrack.length > 0) {
          const midPt = validTrack[Math.floor(validTrack.length / 2)];
          setMapCenter([midPt.lat, midPt.lon]);
          setMapZoom(10.2);
        }
      }
      setLayers((prev) => ({ ...prev, vessels: true }));
    }
  }, [aisData]);

  // Reset view to default AOI of active case
  const handleResetView = useCallback(() => {
    setMapCenter(activeCase.defaultCenter);
    setMapZoom(activeCase.defaultZoom);
  }, [activeCase]);

  // Selected vessel object
  const selectedVesselObj = useMemo(() => {
    if (!selectedVesselName || !Array.isArray(aisData?.vessels)) return null;
    return aisData.vessels.find((v) => v && v.vessel === selectedVesselName) || null;
  }, [selectedVesselName, aisData]);

  // Fallback Loading Screen
  if (isLoading && !satelliteData) {
    return (
      <div className="sci-loading-screen">
        <div className="sci-loading-box">
          <div className="sci-loading-icon-wrap">
            <Radar size={40} className="text-blue-600 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4 mb-1">LOADING {activeCase.badgeText}</h2>
          <p className="text-sm text-slate-500 mb-4">Ingesting Sentinel-1 SAR observations, ERA5 atmospheric wind & CMEMS currents...</p>
        </div>
      </div>
    );
  }

  // Fallback Error Screen
  if (dataError && !satelliteData) {
    return (
      <div className="sci-loading-screen">
        <div className="sci-error-box">
          <AlertCircle size={40} className="text-rose-600 mb-2" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">DATA INGESTION ERROR</h2>
          <p className="text-sm text-slate-500 mb-4">{dataError}</p>
          <button type="button" className="sci-btn btn-primary" onClick={() => window.location.reload()}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sci-app-viewport">
      {/* 1. Header with Corner Hamburger, Case Tabs, and Telemetry */}
      <TopNav
        activeCaseKey={activeCaseKey}
        onSelectCase={handleSelectCase}
        onOpenSarModal={() => setIsSarModalOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        simulationMode={simulationMode}
        onToggleMode={() => handleModeChange(simulationMode === 'forward' ? 'backward' : 'forward')}
      />

      {/* 2. Side Navigation Drawer (Direct Stage Navigation) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentStageId={currentStageId}
        onSelectStage={handleStageSelect}
        stages={workflowStages}
      />

      {/* Main Page Workspace */}
      <main className="sci-main-scroll-container">
        {/* 3. Main Incident Dashboard: Map (64%) + Incident Overview Panel (36%) */}
        <div className="sci-hero-workspace-grid">
          {/* Tactical Map Viewport (Hero: 540px height, Persistent) */}
          <section className="sci-map-container" aria-label="Primary Interactive Geospatial Canvas">
            <TacticalMap
              satelliteData={satelliteData}
              forcingData={forcingData}
              forwardData={forwardData}
              backwardData={backwardData}
              originData={originData}
              aisData={aisData}
              layers={layers}
              onToggleLayer={handleToggleLayer}
              simulationMode={simulationMode}
              timeIndex={timeIndex}
              selectedVesselName={selectedVesselName}
              onSelectVessel={handleSelectVessel}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              onResetView={handleResetView}
            />
          </section>

          {/* Incident Overview Panel (Spill, Drift, Origin, Candidate Vessels) */}
          <aside className="sci-sidebar-container" aria-label="Incident Summary Panel">
            <IncidentOverviewPanel
              satelliteData={satelliteData}
              forcingData={forcingData}
              originData={originData}
              aisData={aisData}
              simulationMode={simulationMode}
              selectedVesselName={selectedVesselName}
              onSelectVessel={handleSelectVessel}
              onOpenSarModal={() => setIsSarModalOpen(true)}
            />
          </aside>
        </div>

        {/* 4. Unified Simulation Toolbar (Directly Under Main Dashboard) */}
        <div className="sci-simulation-timeline-wrapper">
          <SimulationTimeline
            mode={simulationMode}
            timeIndex={timeIndex}
            maxSteps={maxSteps}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            originCoords={originData?.probable_origin}
            onTimeChange={setTimeIndex}
            onTogglePlay={setIsPlaying}
            onReset={() => setTimeIndex(0)}
            onSpeedChange={setPlaybackSpeed}
            onModeChange={handleModeChange}
          />
        </div>

        {/* 5. Investigation Stages Section (Single Stage Detailed Content + Next/Back) */}
        <InvestigationStageSection
          currentStageId={currentStageId}
          onSelectStage={handleStageSelect}
          stages={workflowStages}
          satelliteData={satelliteData}
          forcingData={forcingData}
          originData={originData}
          aisData={aisData}
          selectedVesselName={selectedVesselName}
          onSelectVessel={handleSelectVessel}
          onOpenSarModal={() => setIsSarModalOpen(true)}
          onOpenDossier={(vessel) => {
            if (vessel) {
              setSelectedVesselName(vessel.vessel);
              setIsDossierOpen(true);
            }
          }}
        />

        {/* 6. Data Sources & Technical Provenance */}
        <DataProvenanceSection />
      </main>

      {/* 7. Modals */}
      {isSarModalOpen && (
        <SatelliteSarModal
          satelliteData={satelliteData}
          onClose={() => setIsSarModalOpen(false)}
        />
      )}

      {isDossierOpen && selectedVesselObj && (
        <VesselDossierModal
          vessel={selectedVesselObj}
          originCoords={originData?.probable_origin}
          onClose={() => setIsDossierOpen(false)}
        />
      )}

      {isProvenanceOpen && (
        <DataProvenanceModal
          isOpen={isProvenanceOpen}
          onClose={() => setIsProvenanceOpen(false)}
        />
      )}
    </div>
  );
}

export default App;