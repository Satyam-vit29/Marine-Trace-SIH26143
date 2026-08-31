import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { SatelliteSarLayer } from './SatelliteSarLayer';
import { SpillFootprintLayer } from './SpillFootprintLayer';
import { ParticleFieldLayer } from './ParticleFieldLayer';
import { OriginUncertaintyLayer } from './OriginUncertaintyLayer';
import { VectorFieldLayer } from './VectorFieldLayer';
import { AisVesselsLayer } from './AisVesselsLayer';
import { MapCrosshairHUD } from './MapCrosshairHUD';
import { MapLegend } from './MapLegend';
import { LayerControlHUD } from './LayerControlHUD';
import { Crosshair } from 'lucide-react';

// Camera controller helper for smooth programmatic fly-to
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom && map) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Map instance capturer component
function MapInstanceCapturer({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
}

export function TacticalMap({
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
  mapCenter,
  mapZoom,
  onResetView,
}) {
  const [mapInstance, setMapInstance] = useState(null);
  const [isRecentering, setIsRecentering] = useState(false);

  const defaultCenter = [18.48, 69.95];
  const defaultZoom = 9.5;

  const currentCenter = mapCenter || defaultCenter;
  const currentZoom = mapZoom || defaultZoom;

  const spillLocation = forwardData?.start_location || { lat: 18.50, lon: 70.00 };

  const handleRecenter = useCallback(() => {
    setIsRecentering(true);
    setTimeout(() => setIsRecentering(false), 800);

    if (mapInstance && currentCenter && currentZoom) {
      mapInstance.flyTo(currentCenter, currentZoom, {
        animate: true,
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
    if (onResetView) {
      onResetView();
    }
  }, [mapInstance, currentCenter, currentZoom, onResetView]);

  return (
    <div className="tactical-map-wrapper-light">
      {/* Map Container */}
      <MapContainer
        center={currentCenter}
        zoom={currentZoom}
        className="tactical-leaflet-map-light"
        zoomControl={true}
        attributionControl={true}
      >
        {/* OpenStreetMap Standard Basemap Tiles (Reliable, Zero API Key Warnings) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Dynamic Camera View Controller */}
        <MapViewController center={currentCenter} zoom={currentZoom} />

        {/* 1. Real Sentinel-1 SAR Radar Scene & Detected Slick Mask */}
        <SatelliteSarLayer
          satelliteData={satelliteData}
          showSarImage={layers.sarImage}
          showSlickMask={layers.spill}
          showBBox={layers.satellite}
          sarOpacity={0.82}
        />

        {/* 2. Detected Oil Spill Center Marker */}
        <SpillFootprintLayer
          spillLocation={spillLocation}
          isVisible={layers.spill}
        />

        {/* 3. Forward Drift Forecast Layer (OpenOil 24h) */}
        {simulationMode === 'forward' && (
          <ParticleFieldLayer
            data={forwardData}
            mode="forward"
            isVisible={layers.forward}
            timeIndex={timeIndex}
            showTrails={true}
            showDensity={true}
          />
        )}

        {/* 4. Backward Hindcast Layer (OpenDrift 12h) */}
        {simulationMode === 'backward' && (
          <ParticleFieldLayer
            data={backwardData}
            mode="backward"
            isVisible={layers.backward}
            timeIndex={timeIndex}
            showTrails={true}
            showDensity={true}
          />
        )}

        {/* 5. Probable Origin & 95% Uncertainty Zone */}
        <OriginUncertaintyLayer
          originData={originData}
          showOrigin={layers.origin}
          showUncertainty={layers.origin || layers.backward}
        />

        {/* 6. ERA5 Wind & Copernicus Marine Current Flow Vectors */}
        <VectorFieldLayer
          forcingData={forcingData}
          center={currentCenter}
          showCurrent={layers.currents}
          showWind={layers.wind}
        />

        {/* 7. Candidate AIS Vessel Corridors & CPA Vectors */}
        <AisVesselsLayer
          aisData={aisData}
          selectedVesselName={selectedVesselName}
          onSelectVessel={onSelectVessel}
          originCoords={originData?.probable_origin}
          isVisible={layers.vessels}
        />

        {/* Map instance capturer for direct imperative control */}
        <MapInstanceCapturer onMapReady={setMapInstance} />

        {/* Geodetic Telemetry Cursor HUD */}
        <MapCrosshairHUD />
      </MapContainer>

      {/* Floating Tactical Layer Toggles */}
      <LayerControlHUD
        layers={layers}
        onToggleLayer={onToggleLayer}
      />

      {/* Floating Symbology Legend */}
      <MapLegend />

      {/* Floating Action: Recenter AOI */}
      <button
        type="button"
        className={`map-center-btn-light ${isRecentering ? 'is-spinning' : ''}`}
        onClick={handleRecenter}
        title="Reset Map Camera to Operational AOI Center"
      >
        <Crosshair size={14} className={isRecentering ? 'animate-spin' : ''} />
        <span>RECENTER AOI</span>
      </button>
    </div>
  );
}
