import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Crosshair, Compass, ZoomIn } from 'lucide-react';
import { formatCoordinates } from '../../utils/geoUtils';

export function MapCrosshairHUD() {
  const [cursorCoords, setCursorCoords] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(9.5);

  const map = useMapEvents({
    mousemove: (e) => {
      setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
  });

  return (
    <div className="map-telemetry-hud" aria-live="polite">
      <div className="telemetry-chip">
        <Crosshair size={13} className="chip-icon" />
        <span className="chip-label">CURSOR:</span>
        <span className="chip-value font-mono">
          {cursorCoords
            ? formatCoordinates(cursorCoords.lat, cursorCoords.lon, 'decimal')
            : 'HOVER OVER MAP'}
        </span>
      </div>

      <div className="telemetry-chip">
        <Compass size={13} className="chip-icon" />
        <span className="chip-label">GRID:</span>
        <span className="chip-value font-mono">WGS-84 / EEZ</span>
      </div>

      <div className="telemetry-chip">
        <ZoomIn size={13} className="chip-icon" />
        <span className="chip-label">ZOOM:</span>
        <span className="chip-value font-mono">{zoomLevel.toFixed(1)}x</span>
      </div>
    </div>
  );
}
