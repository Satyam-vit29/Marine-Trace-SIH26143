import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { formatCoordinates } from '../../utils/geoUtils';

// Scientific detected oil spill icon
const createSpillIcon = () => {
  return L.divIcon({
    className: 'sci-spill-marker',
    html: `
      <div class="spill-marker-container">
        <div class="spill-pulsing-halo"></div>
        <div class="spill-inner-core">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        <span class="spill-map-tag">SPILL DETECTED</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export function SpillFootprintLayer({ spillLocation, isVisible = true }) {
  if (!isVisible || !spillLocation) return null;

  const lat = spillLocation.lat || spillLocation[0];
  const lon = spillLocation.lon || spillLocation[1];

  return (
    <>
      {/* Primary Spill Core Slick */}
      <Circle
        center={[lat, lon]}
        radius={1200}
        pathOptions={{
          color: '#ea580c',
          weight: 2.8,
          fillColor: '#f97316',
          fillOpacity: 0.32,
          className: 'pulsing-slick-circle',
        }}
      />

      {/* Outer Sheen Dispersion Boundary */}
      <Circle
        center={[lat, lon]}
        radius={2200}
        pathOptions={{
          color: '#fb923c',
          weight: 1.8,
          dashArray: '4, 5',
          fillColor: '#fed7aa',
          fillOpacity: 0.16,
        }}
      />

      {/* Central Marker */}
      <Marker position={[lat, lon]} icon={createSpillIcon()}>
        <Popup className="tactical-leaflet-popup">
          <div className="p-3">
            <div className="font-bold text-xs text-orange-900 mb-1">
              DETECTED OIL SPILL SLICK
            </div>
            <div className="text-xs text-slate-700 space-y-1 font-mono">
              <div>Incident ID: <strong>DEMO-001</strong></div>
              <div>Centroid: <strong>{formatCoordinates(lat, lon, 'decimal')}</strong></div>
              <div>Area: <strong>10.38 km²</strong> | Perimeter: <strong>13.91 km</strong></div>
              <div>Sensor: <strong>Sentinel-1 SAR</strong></div>
              <div>Acquisition: <strong>2026-08-28 18:00:00 UTC</strong></div>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
