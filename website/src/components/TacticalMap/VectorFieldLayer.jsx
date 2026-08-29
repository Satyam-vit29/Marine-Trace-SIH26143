import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

// Create high-visibility scientific vector arrow icon
const createVectorArrowIcon = (type, angleDeg, speedMs) => {
  const isCurrent = type === 'current';
  const color = isCurrent ? '#0d9488' : '#2563eb'; // Teal for ocean current, Blue for wind
  const strokeColor = isCurrent ? '#0f766e' : '#1d4ed8';
  const lengthPx = isCurrent ? Math.min(32, Math.max(18, speedMs * 80)) : Math.min(36, Math.max(20, speedMs * 7));

  return L.divIcon({
    className: `sci-vector-icon vector-${type}`,
    html: `
      <div class="vector-arrow-container" style="transform: rotate(${angleDeg}deg);">
        <svg viewBox="0 0 40 40" width="${lengthPx}" height="${lengthPx}" class="vector-arrow-svg">
          <!-- Vector line -->
          <line x1="20" y1="36" x2="20" y2="8" stroke="${color}" stroke-width="${isCurrent ? 2.2 : 1.8}" stroke-dasharray="${isCurrent ? 'none' : '3, 2'}" opacity="0.95" />
          <!-- Arrow head -->
          <polygon points="20,3 13,14 27,14" fill="${color}" stroke="${strokeColor}" stroke-width="0.8" />
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export function VectorFieldLayer({ 
  forcingData,
  center = [16.50, 82.80],
  showCurrent = true, 
  showWind = true 
}) {
  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};

  const windBearing = atmo.direction_deg || 42.5;
  const windSpeed = atmo.speed_mean_ms || 4.12;

  const currentBearing = hydro.direction_deg || 38.0;
  const currentSpeed = hydro.speed_mean_ms || 0.28;

  const centerLat = center?.[0] || 16.50;
  const centerLon = center?.[1] || 82.80;

  // Spatial hydrodynamic vector grid covering the active case AOI
  const gridCells = useMemo(() => {
    const cells = [];
    const minLat = centerLat - 0.22;
    const maxLat = centerLat + 0.18;
    const minLon = centerLon - 0.28;
    const maxLon = centerLon + 0.26;
    const stepsLat = 4;
    const stepsLon = 5;

    for (let i = 0; i <= stepsLat; i++) {
      const lat = minLat + (i / stepsLat) * (maxLat - minLat);
      for (let j = 0; j <= stepsLon; j++) {
        const lon = minLon + (j / stepsLon) * (maxLon - minLon);
        const latOffset = (lat - centerLat);
        const lonOffset = (lon - centerLon);
        
        const localCurrentBearing = currentBearing + (lonOffset * 4.0) - (latOffset * 2.0);
        const localCurrentSpeed = currentSpeed + (latOffset * 0.02);

        const localWindBearing = windBearing + (lonOffset * 2.0);
        const localWindSpeed = windSpeed + (latOffset * 0.1);

        cells.push({
          lat,
          lon,
          currentAngle: localCurrentBearing,
          currentSpd: localCurrentSpeed,
          windAngle: localWindBearing,
          windSpd: localWindSpeed,
        });
      }
    }
    return cells;
  }, [centerLat, centerLon, currentBearing, currentSpeed, windBearing, windSpeed]);

  return (
    <>
      {/* Copernicus Marine Ocean Current Vector Field */}
      {showCurrent && (
        gridCells.map((cell, idx) => (
          <Marker
            key={`curr-${idx}`}
            position={[cell.lat + 0.012, cell.lon - 0.01]}
            icon={createVectorArrowIcon('current', cell.currentAngle, cell.currentSpd)}
            interactive={false}
          />
        ))
      )}

      {/* ERA5 Surface Wind Vector Field */}
      {showWind && (
        gridCells.map((cell, idx) => (
          <Marker
            key={`wind-${idx}`}
            position={[cell.lat - 0.015, cell.lon + 0.018]}
            icon={createVectorArrowIcon('wind', cell.windAngle, cell.windSpd)}
            interactive={false}
          />
        ))
      )}
    </>
  );
}
