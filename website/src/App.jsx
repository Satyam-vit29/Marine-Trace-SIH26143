import { useState, useEffect, useCallback, useMemo } from 'react';
import { TopNav } from './components/TopNav';
import { StageWorkflowBar } from './components/StageWorkflowBar';
import { TacticalMap } from './components/TacticalMap/TacticalMap';
import { SimulationTimeline } from './components/Timeline/SimulationTimeline';
import { SatelliteAnalysisPanel } from './components/Panels/SatelliteAnalysisPanel';
import { EnvironmentalHUD } from './components/Panels/EnvironmentalHUD';
import { OriginAnalysisPanel } from './components/Panels/OriginAnalysisPanel';
import { VesselRankingPanel } from './components/Panels/VesselRankingPanel';
import { VesselDossierModal } from './components/Panels/VesselDossierModal';
import { SatelliteSarModal } from './components/Panels/SatelliteSarModal';
import { DataProvenanceModal } from './components/Panels/DataProvenanceModal';

// Lower Page Deep-Dive Sections
import { SatelliteSection } from './components/Sections/SatelliteSection';
import { EnvironmentalSection } from './components/Sections/EnvironmentalSection';
import { DriftOriginSection } from './components/Sections/DriftOriginSection';
import { AisCorrelationSection } from './components/Sections/AisCorrelationSection';
import { DataProvenanceSection } from './components/Sections/DataProvenanceSection';

import { DEMO_CASES, getWorkflowStages } from './utils/envConstants';
import { 
  Satellite, 
  Waves, 
  Target, 
  Ship, 
  Radar, 
  AlertCircle 
} from 'lucide-react';
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

  // 3. Active Stage & Simulation Mode
  const [currentStageId, setCurrentStageId] = useState('SATELLITE');
  const [simulationMode, setSimulationMode] = useState('forward'); // 'forward' | 'backward'

  // 4. Playback & Scrubber States
  const [timeIndex, setTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // 5. Map Layer Visibility (Single Central Interactive Map)
  const [layers, setLayers] = useState({
    sarImage: true,
    satellite: true,
    spill: true,
    forward: true,
    backward: false,
    origin: false,
    currents: true,
    wind: true,
    vessels: false,
  });

  // 6. Candidate Vessel & Modals
  const [selectedVesselName, setSelectedVesselName] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSarModalOpen, setIsSarModalOpen] = useState(false);
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('satellite');

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
          setSatelliteData(embeddedCase.satellite);
          setForcingData(embeddedCase.forcing);
          setForwardData(embeddedCase.forward);
          setBackwardData(embeddedCase.backward);
          setOriginData(embeddedCase.origin);
          setAisData(embeddedCase.ais);
          setIsLoading(false);
        });
        return;
      }
    }

    // Dynamic fetch from case data directory
    const dataPath = targetCase.dataPath;
    Promise.all([
      fetch(`${dataPath}/satellite_detection.json`).then((r) => {
        if (!r.ok) return fetch('/satellite_detection.json').then((res) => res.json());
        return r.json();
      }),
      fetch(`${dataPath}/environmental_forcing.json`).then((r) => {
        if (!r.ok) return fetch('/environmental_forcing.json').then((res) => res.json());
        return r.json();
      }),
      fetch(`${dataPath}/trajectory.json`).then((r) => {
        if (!r.ok) return fetch('/trajectory.json').then((res) => res.json());
        return r.json();
      }),
      fetch(`${dataPath}/backward_trajectory.json`).then((r) => {
        if (!r.ok) return fetch('/backward_trajectory.json').then((res) => res.json());
        return r.json();
      }),
      fetch(`${dataPath}/origin.json`).then((r) => {
        if (!r.ok) return fetch('/origin.json').then((res) => res.json());
        return r.json();
      }),
      fetch(`${dataPath}/ais_web.json`).then((r) => {
        if (!r.ok) return fetch('/ais_web.json').then((res) => res.json());
        return r.json();
      }),
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
        setDataError(err.message);
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
    setActiveSidebarTab('satellite');
    setMapCenter(targetCase.defaultCenter);
    setMapZoom(targetCase.defaultZoom);
    setLayers({
      sarImage: true,
      satellite: true,
      spill: true,
      forward: true,
      backward: false,
      origin: false,
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
    setLayers((prev) => ({
      ...prev,
      ...stage.layers,
    }));

    // Apply stage mode
    setSimulationMode(stage.mode);
    setTimeIndex(0);
    setIsPlaying(false);

    // Apply camera focus
    if (stage.center && stage.zoom) {
      setMapCenter(stage.center);
      setMapZoom(stage.zoom);
    }

    // Auto-switch sidebar tab according to active stage
    if (stageId === 'SATELLITE' || stageId === 'CHARACTERIZE') {
      setActiveSidebarTab('satellite');
    } else if (stageId === 'ENVIRONMENT') {
      setActiveSidebarTab('environment');
    } else if (stageId === 'FORECAST' || stageId === 'HINDCAST') {
      setActiveSidebarTab('origin');
    } else if (stageId === 'CORRELATE' || stageId === 'ATTRIBUTE') {
      setActiveSidebarTab('vessels');
      if (stage.highlightVessel) {
        setSelectedVesselName(stage.highlightVessel);
      }
    }
  }, [workflowStages]);

  // Mode change handler (Forward vs Backward)
  const handleModeChange = useCallback((mode) => {
    setSimulationMode(mode);
    setTimeIndex(0);
    setIsPlaying(false);
    if (mode === 'forward') {
      setLayers((prev) => ({ ...prev, forward: true, backward: false }));
      setActiveSidebarTab('satellite');
    } else {
      setLayers((prev) => ({ ...prev, forward: false, backward: true, origin: true }));
      setActiveSidebarTab('origin');
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
    if (vesselName && aisData?.vessels) {
      const vessel = aisData.vessels.find((v) => v.vessel === vesselName);
      if (vessel && vessel.track && vessel.track.length > 0) {
        const midPt = vessel.track[Math.floor(vessel.track.length / 2)];
        setMapCenter([midPt.lat, midPt.lon]);
        setMapZoom(10.2);
      }
      setActiveSidebarTab('vessels');
    }
  }, [aisData]);

  // Reset view to default AOI of active case
  const handleResetView = useCallback(() => {
    setMapCenter(activeCase.defaultCenter);
    setMapZoom(activeCase.defaultZoom);
  }, [activeCase]);

  // Focus origin
  const handleFocusOrigin = useCallback(() => {
    if (originData?.probable_origin) {
      setMapCenter([originData.probable_origin.lat, originData.probable_origin.lon]);
      setMapZoom(11.2);
    }
  }, [originData]);

  // Focus spill
  const handleFocusSpill = useCallback(() => {
    if (satelliteData?.slick_characterization?.centroid) {
      const c = satelliteData.slick_characterization.centroid;
      setMapCenter([c.lat, c.lon]);
      setMapZoom(11.5);
    } else {
      setMapCenter(activeCase.spillCenter ? [activeCase.spillCenter.lat, activeCase.spillCenter.lon] : activeCase.defaultCenter);
      setMapZoom(11.5);
    }
  }, [satelliteData, activeCase]);

  // Selected vessel object
  const selectedVesselObj = useMemo(() => {
    if (!selectedVesselName || !aisData?.vessels) return null;
    return aisData.vessels.find((v) => v.vessel === selectedVesselName) || null;
  }, [selectedVesselName, aisData]);

  if (isLoading && !satelliteData) {
    return (
      <div className="sci-loading-screen">
        <div className="sci-loading-box">
          <div className="sci-loading-icon-wrap">
            <Radar size={40} className="text-blue-600 animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-4 mb-1">LOADING {activeCase.badgeText}</h2>
          <p className="text-sm text-slate-500 mb-4">Ingesting Sentinel-1 SAR observations, ERA5 atmospheric wind & CMEMS currents...</p>
          <div className="sci-loading-bar-track">
            <div className="sci-loading-bar-fill" />
          </div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="sci-loading-screen">
        <div className="sci-loading-box">
          <AlertCircle size={40} className="text-rose-600 mb-2" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">DATA INGESTION ERROR</h2>
          <p className="text-sm text-slate-500 mb-4">{dataError}</p>
          <button className="sci-btn btn-primary" onClick={() => window.location.reload()}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sci-app-viewport">
      {/* 1. Clean Top Header with Case Selector */}
      <TopNav
        activeCaseKey={activeCaseKey}
        onSelectCase={handleSelectCase}
        onOpenSarModal={() => setIsSarModalOpen(true)}
        simulationMode={simulationMode}
        onToggleMode={() => handleModeChange(simulationMode === 'forward' ? 'backward' : 'forward')}
      />

      {/* 2. Simplified 7-Stage Workflow Bar (Never Overlaps, Case-Adaptive) */}
      <StageWorkflowBar
        currentStageId={currentStageId}
        onSelectStage={handleStageSelect}
        stages={workflowStages}
      />

      {/* Main Page Scroll Container (Natural Vertical Scrolling) */}
      <main className="sci-main-scroll-container">
        {/* 3. Hero Main Workspace: 68% Central Map + 32% Information/Analysis Panel */}
        <div className="sci-hero-workspace-grid">
          {/* Main Map Viewport (Hero: 680px height) */}
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

            {/* Simulation Timeline Scrubber HUD with RUN FORECAST & RUN BACKTRACK */}
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
          </section>

          {/* Right Information & Metrics Analysis Panel (Information Only, No Map) */}
          <aside className="sci-sidebar-container" aria-label="Investigation Information Panel">
            {/* Tab Navigation */}
            <div className="sci-sidebar-tabs">
              <button
                className={`sci-tab-btn ${activeSidebarTab === 'satellite' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('satellite')}
              >
                <Satellite size={15} />
                <span>SATELLITE</span>
              </button>

              <button
                className={`sci-tab-btn ${activeSidebarTab === 'environment' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('environment')}
              >
                <Waves size={15} />
                <span>ENVIRONMENT</span>
              </button>

              <button
                className={`sci-tab-btn ${activeSidebarTab === 'origin' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('origin')}
              >
                <Target size={15} />
                <span>ORIGIN</span>
              </button>

              <button
                className={`sci-tab-btn ${activeSidebarTab === 'vessels' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('vessels')}
              >
                <Ship size={15} />
                <span>AIS</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="sci-tab-body">
              {activeSidebarTab === 'satellite' && (
                <SatelliteAnalysisPanel
                  satelliteData={satelliteData}
                  onOpenSarModal={() => setIsSarModalOpen(true)}
                  onFocusSpill={handleFocusSpill}
                />
              )}

              {activeSidebarTab === 'environment' && (
                <EnvironmentalHUD
                  forcingData={forcingData}
                />
              )}

              {activeSidebarTab === 'origin' && (
                <OriginAnalysisPanel
                  originData={originData}
                  onFocusOrigin={handleFocusOrigin}
                />
              )}

              {activeSidebarTab === 'vessels' && (
                <VesselRankingPanel
                  vessels={aisData?.vessels || []}
                  filterFunnel={aisData?.filter_funnel}
                  selectedVesselName={selectedVesselName}
                  onSelectVessel={handleSelectVessel}
                  onOpenDossier={(vessel) => {
                    setSelectedVesselName(vessel.vessel);
                    setIsDossierOpen(true);
                  }}
                />
              )}
            </div>
          </aside>
        </div>

        {/* 4. Deep-Dive Scrollable Analysis Sections Below the Map */}
        <div className="sci-sections-wrapper">
          {/* Section 1: Satellite SAR Remote Sensing */}
          <SatelliteSection 
            satelliteData={satelliteData} 
            onOpenSarModal={() => setIsSarModalOpen(true)} 
          />

          {/* Section 2: Environmental Hydrodynamic & Atmospheric Forcing */}
          <EnvironmentalSection 
            forcingData={forcingData} 
          />

          {/* Section 3: Drift Simulation & Probable Spill Origin */}
          <DriftOriginSection 
            forwardData={forwardData} 
            originData={originData}
          />

          {/* Section 4: AIS Spatio-Temporal Filtering & Candidate Attribution */}
          <AisCorrelationSection 
            vessels={aisData?.vessels || []}
            filterFunnel={aisData?.filter_funnel}
            selectedVesselName={selectedVesselName}
            onSelectVessel={handleSelectVessel}
            onOpenDossier={(vessel) => {
              setSelectedVesselName(vessel.vessel);
              setIsDossierOpen(true);
            }}
          />

          {/* Section 5: Data Sources & Technical Provenance */}
          <DataProvenanceSection />
        </div>
      </main>

      {/* 5. Modals */}
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

      <DataProvenanceModal
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
      />
    </div>
  );
}

export default App;