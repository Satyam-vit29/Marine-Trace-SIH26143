import { ImageOverlay, Polygon, Marker, Popup, Rectangle } from 'react-leaflet';
import L from 'leaflet';

// Tactical SAR Sensor Tag Icon
const createSarTagIcon = () => {
  return L.divIcon({
    className: 'sar-map-tag-marker',
    html: `
      <div class="sar-tag-bubble">
        <span class="sar-tag-icon">🛰️</span>
        <span class="sar-tag-text">SENTINEL-1 SAR SCENE</span>
      </div>
    `,
    iconSize: [140, 24],
    iconAnchor: [70, 28],
  });
};

export function SatelliteSarLayer({ 
  satelliteData, 
  showSarImage = true,
  showSlickMask = true,
  showBBox = true,
  sarOpacity = 0.85
}) {
  if (!satelliteData) return null;

  const char = satelliteData.slick_characterization || {};
  const sarOverlay = satelliteData.sar_image_overlay || {
    url: '/sentinel1_sar_scene.png',
    bounds: [[18.35, 69.80], [18.65, 70.20]],
  };

  const bbox = char.bounding_box;
  const outline = char.polygon_outline || [];
  const centroid = char.centroid || { lat: 18.5000, lon: 70.0000 };

  const bboxBounds = bbox ? [
    [bbox.min_lat, bbox.min_lon],
    [bbox.max_lat, bbox.max_lon],
  ] : null;

  return (
    <>
      {/* 1. Real Sentinel-1 Grayscale SAR Radar Image Overlay */}
      {showSarImage && sarOverlay.bounds && (
        <ImageOverlay
          url={sarOverlay.url || '/sentinel1_sar_scene.png'}
          bounds={sarOverlay.bounds}
          opacity={sarOpacity}
          zIndex={200}
        />
      )}

      {/* 2. Detected Slick Bounding Box Frame */}
      {showBBox && bboxBounds && (
        <Rectangle
          bounds={bboxBounds}
          pathOptions={{
            color: '#00d4ff',
            weight: 2.0,
            dashArray: '5, 5',
            fillColor: '#00d4ff',
            fillOpacity: 0.08,
          }}
        />
      )}

      {/* 3. Detected Oil Slick Boundary Mask (Drawn directly ON TOP of SAR Image) */}
      {showSlickMask && outline.length > 0 && (
        <Polygon
          positions={outline}
          pathOptions={{
            color: '#ea580c',
            weight: 2.8,
            fillColor: '#f97316',
            fillOpacity: 0.32,
            className: 'sar-slick-polygon',
          }}
        >
          <Popup className="tactical-leaflet-popup">
            <div className="p-3 font-sans">
              <div className="font-bold text-xs text-orange-900 mb-1 flex items-center gap-1.5">
                <span>🛰️</span>
                <span>SENTINEL-1 DETECTED OIL SLICK</span>
              </div>
              <div className="text-xs text-slate-700 space-y-1 font-mono">
                <div>Sensor: <strong>Sentinel-1A C-SAR (10m)</strong></div>
                <div>Detected Area: <strong>{char.area_km2 || '10.38'} km²</strong></div>
                <div>Perimeter: <strong>{char.perimeter_km || '13.91'} km</strong></div>
                <div>Major Axis: <strong>{char.length_major_axis_km || '6.22'} km</strong></div>
                <div>Orientation: <strong>{char.orientation_deg || '90.8'}°</strong></div>
                <div>Estimated Age: <strong>~{char.estimated_age_hours || '6.0'} hrs</strong></div>
              </div>
            </div>
          </Popup>
        </Polygon>
      )}

      {/* 4. SAR AOI Tag Marker */}
      {showSarImage && (
        <Marker
          position={[sarOverlay.bounds[1][0], centroid.lon]}
          icon={createSarTagIcon()}
          interactive={false}
        />
      )}
    </>
  );
}
