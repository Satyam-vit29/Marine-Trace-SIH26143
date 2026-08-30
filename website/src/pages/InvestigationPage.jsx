import { TacticalMap } from '../components/TacticalMap/TacticalMap';
import { SimulationTimeline } from '../components/Timeline/SimulationTimeline';

import { SatelliteSection } from '../components/Sections/SatelliteSection';

import { SatelliteAnalysisPanel } from '../components/Panels/SatelliteAnalysisPanel';
import { EnvironmentalHUD } from '../components/Panels/EnvironmentalHUD';
import { OriginAnalysisPanel } from '../components/Panels/OriginAnalysisPanel';
import { VesselRankingPanel } from '../components/Panels/VesselRankingPanel';

import { PageNavigation } from '../components/PageNavigation';

export function InvestigationPage({
  currentStageId,
  activeSidebarTab,

  satelliteData,
  forcingData,
  forwardData,
  backwardData,
  originData,
  aisData,

  layers,
  onToggleLayer,
  simulationMode,
  timeIndex,

  selectedVesselName,
  onSelectVessel,
  onOpenDossier,

  mapCenter,
  mapZoom,
  onResetView,

  maxSteps,
  isPlaying,
  playbackSpeed,

  setTimeIndex,
  setIsPlaying,
  setPlaybackSpeed,

  onModeChange,
  onOpenSarModal,
  onFocusSpill,
}) {
  return (
    <div className="page-content">
      <section className="page-header">
        <div>
          <span className="page-eyebrow">
            PHASE 01 / INVESTIGATION
          </span>

          <h1>Investigation Overview</h1>

          <p>
            Tactical geospatial investigation and satellite-based
            marine pollution detection.
          </p>
        </div>
      </section>

      <section className="sci-hero-workspace-grid">
        <section
          className="sci-map-container"
          aria-label="Primary Interactive Geospatial Canvas"
        >
          <TacticalMap
            satelliteData={satelliteData}
            forcingData={forcingData}
            forwardData={forwardData}
            backwardData={backwardData}
            originData={originData}
            aisData={aisData}
            layers={layers}
            onToggleLayer={onToggleLayer}
            simulationMode={simulationMode}
            timeIndex={timeIndex}
            selectedVesselName={selectedVesselName}
            onSelectVessel={onSelectVessel}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onResetView={onResetView}
          />

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
            onModeChange={onModeChange}
          />
        </section>

        <aside className="sci-sidebar-container">
  <div className="sci-tab-body">

    {activeSidebarTab === 'satellite' && (
      <SatelliteAnalysisPanel
        satelliteData={satelliteData}
        onOpenSarModal={onOpenSarModal}
        onFocusSpill={onFocusSpill}
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
        forwardData={forwardData}
        backwardData={backwardData}
      />
    )}

    {activeSidebarTab === 'vessels' && (
      <VesselRankingPanel
        vessels={aisData?.vessels || []}
        selectedVesselName={selectedVesselName}
        onSelectVessel={onSelectVessel}
        onOpenDossier={onOpenDossier}
      />
    )}

  </div>
</aside>
      </section>

      <section className="page-section">
        <SatelliteSection
          satelliteData={satelliteData}
          onOpenSarModal={onOpenSarModal}
        />
      </section>

      <PageNavigation currentPage="/" />
    </div>
  );
}