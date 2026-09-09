import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Scientific target marker for Probable Origin
const createOriginIcon = () => {
  return L.divIcon({
    className: 'sci-origin-marker',
    html: `
      <div class="origin-marker-container">
        <div class="origin-reticle-ring"></div>
        <div class="origin-center-dot"></div>
        <span class="origin-map-tag">PROBABLE ORIGIN</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export function OriginUncertaintyLayer({ 
  originData, 
  showOrigin = true, 
  showUncertainty = true 
}) {
  if (!originData || !originData.probable_origin) return null;

  const lat = originData.probable_origin.lat;
  const lon = originData.probable_origin.lon;

  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return null;

  // Uncertainty radii from data or standard defaults
  const outerRadiusMeters = (originData.uncertainty?.containment_radius_95_km 
    ? originData.uncertainty.containment_radius_95_km * 1000 
    : 2800);
  const innerRadiusMeters = (originData.uncertainty?.semi_minor_km 
    ? originData.uncertainty.semi_minor_km * 1000 
    : Math.round(outerRadiusMeters * 0.5));

  return (
    <>
      {showUncertainty && (
        <>
          {/* Outer Uncertainty Region (95% CI) */}
          <Circle
            center={[lat, lon]}
            radius={outerRadiusMeters}
            pathOptions={{
              color: '#ea580c',
              weight: 2.0,
              dashArray: '5, 5',
              fillColor: '#f97316',
              fillOpacity: 0.16,
              className: 'uncertainty-outer-circle',
            }}
          />

          {/* Inner Dispersion Core (68% CI) */}
          <Circle
            center={[lat, lon]}
            radius={innerRadiusMeters}
            pathOptions={{
              color: '#c2410c',
              weight: 2.2,
              fillColor: '#ea580c',
              fillOpacity: 0.28,
              className: 'uncertainty-inner-circle',
            }}
          />
        </>
      )}

      {showOrigin && (
        <Marker position={[lat, lon]} icon={createOriginIcon()}>
          <Popup className="tactical-leaflet-popup">
            <div className="p-3">
              <div className="font-bold text-xs text-orange-900 mb-1">
                PROBABLE SPILL ORIGIN (HINDCAST MEDIAN)
              </div>
              <div className="text-xs text-slate-700 space-y-1 font-mono">
                <div>Latitude: <strong>{lat.toFixed(6)}° N</strong></div>
                <div>Longitude: <strong>{lon.toFixed(6)}° E</strong></div>
                <div>Method: <strong>Backward OpenDrift Median</strong></div>
                <div>Hindcast Window: <strong>12 Hours (18:00 → 06:00 UTC)</strong></div>
                <div>Uncertainty: <strong>±2.80 km (95% CI)</strong></div>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
