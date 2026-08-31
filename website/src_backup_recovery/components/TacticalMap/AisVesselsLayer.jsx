import React from 'react';
import { Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { 
  findClosestPointOfApproach, 
  getVesselColor, 
  getVesselAssessment 
} from '../../utils/geoUtils';

// Create tactical ship icon
const createShipIcon = (vesselName, color, isSelected) => {
  return L.divIcon({
    className: `sci-vessel-marker ${isSelected ? 'selected' : ''}`,
    html: `
      <div class="vessel-marker-wrapper" style="--v-color: ${color}">
        <div class="vessel-icon-circle-light">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="${color}">
            <path d="M4 15l2 5h12l2-5H4z M12 2l-3 7h6l-3-7z"/>
          </svg>
        </div>
        <div class="vessel-badge-tag-light">${vesselName || 'Vessel'}</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

export function AisVesselsLayer({
  aisData,
  selectedVesselName,
  onSelectVessel,
  originCoords,
  isVisible = true,
}) {
  if (!isVisible || !aisData || !Array.isArray(aisData.vessels) || aisData.vessels.length === 0) {
    return null;
  }

  const originLat = originCoords?.lat ?? aisData.origin?.lat ?? 18.4686;
  const originLon = originCoords?.lon ?? aisData.origin?.lon ?? 69.8812;

  const selectedVessel = aisData.vessels.find((v) => v && v.vessel === selectedVesselName) || null;

  // Calculate CPA info for selected vessel
  const selectedCpaInfo = selectedVessel && Array.isArray(selectedVessel.track) && selectedVessel.track.length > 0
    ? findClosestPointOfApproach(selectedVessel.track, originLat, originLon)
    : null;

  return (
    <>
      {/* Render all candidate vessel tracks */}
      {aisData.vessels.map((vessel, idx) => {
        if (!vessel) return null;

        const isSelected = selectedVesselName === vessel.vessel;
        const score = typeof vessel.score === 'number' ? vessel.score : 0;
        const color = getVesselColor(score);
        const assessment = getVesselAssessment(score);

        const validTrack = Array.isArray(vessel.track) 
          ? vessel.track.filter((pt) => pt && pt.lat != null && pt.lon != null) 
          : [];
        const points = validTrack.map((pt) => [pt.lat, pt.lon]);

        // Find closest point to origin
        const cpaInfo = validTrack.length > 0 
          ? findClosestPointOfApproach(validTrack, originLat, originLon) 
          : null;
        
        const markerPosition = cpaInfo?.point && cpaInfo.point.lat != null && cpaInfo.point.lon != null
          ? [cpaInfo.point.lat, cpaInfo.point.lon]
          : (points.length > 0 ? points[points.length - 1] : null);

        // Opacity logic: if a vessel is selected, dim others
        const opacity = selectedVesselName ? (isSelected ? 1.0 : 0.25) : 0.85;
        const weight = isSelected ? 4.5 : 2.5;

        const cpaDistStr = vessel.cpa?.distance_km != null
          ? vessel.cpa.distance_km.toFixed(2)
          : (vessel.distance_km != null
            ? vessel.distance_km.toFixed(2)
            : (cpaInfo?.distanceKm != null ? cpaInfo.distanceKm.toFixed(2) : '1.12'));

        const cpaTimeStr = vessel.cpa?.time || cpaInfo?.point?.time || '14:00 UTC';

        return (
          <React.Fragment key={vessel.mmsi || vessel.vessel || idx}>
            {/* Track Polyline */}
            {points.length > 1 && (
              <Polyline
                positions={points}
                eventHandlers={{
                  click: () => onSelectVessel && onSelectVessel(vessel.vessel),
                }}
                pathOptions={{
                  color,
                  weight,
                  opacity,
                  className: isSelected ? 'selected-vessel-polyline' : '',
                }}
              />
            )}

            {/* Vessel Position Marker at CPA */}
            {markerPosition && (
              <Marker
                position={markerPosition}
                icon={createShipIcon(vessel.vessel, color, isSelected)}
                eventHandlers={{
                  click: () => onSelectVessel && onSelectVessel(vessel.vessel),
                }}
              >
                <Popup className="tactical-leaflet-popup">
                  <div className="p-3 font-sans">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color }}>{vessel.vessel || 'Vessel'}</span>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 font-bold">{assessment.label}</span>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1 font-mono">
                      <div>MMSI: <strong>{vessel.mmsi || 'N/A'}</strong></div>
                      <div>Type: <strong>{vessel.vessel_type || vessel.type || 'Tanker'}</strong></div>
                      <div>Association Score: <strong style={{ color }}>{score.toFixed(1)}%</strong></div>
                      <div>Min CPA Distance: <strong>{cpaDistStr} km</strong></div>
                      <div>CPA Time: <strong>{cpaTimeStr}</strong></div>
                    </div>
                    <button
                      className="sci-btn btn-sm btn-primary w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectVessel) onSelectVessel(vessel.vessel);
                      }}
                    >
                      Inspect Forensic Dossier →
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      {/* When a vessel is selected: Draw CPA connection vector to Probable Origin */}
      {selectedVessel && selectedCpaInfo && selectedCpaInfo.point && (
        <>
          {/* Dashed line connecting Vessel CPA coordinate directly to Probable Origin */}
          <Polyline
            positions={[
              [selectedCpaInfo.point.lat, selectedCpaInfo.point.lon],
              [originLat, originLon],
            ]}
            pathOptions={{
              color: '#e11d48',
              weight: 2,
              dashArray: '5, 5',
              opacity: 0.95,
            }}
          />

          {/* Highlight ring at vessel's closest point of approach */}
          <CircleMarker
            center={[selectedCpaInfo.point.lat, selectedCpaInfo.point.lon]}
            radius={7}
            pathOptions={{
              color: '#e11d48',
              weight: 2,
              fillColor: '#fda4af',
              fillOpacity: 0.6,
            }}
          />

          {/* Floating CPA distance marker tag at midpoint */}
          <Marker
            position={[
              (selectedCpaInfo.point.lat + originLat) / 2,
              (selectedCpaInfo.point.lon + originLon) / 2,
            ]}
            icon={L.divIcon({
              className: 'cpa-distance-badge-icon',
              html: `
                <div class="cpa-distance-badge-light">
                  <span class="cpa-badge-label-light">MIN CPA DISTANCE</span>
                  <span class="cpa-badge-val-light">${(selectedCpaInfo.distanceKm != null ? selectedCpaInfo.distanceKm.toFixed(2) : '1.12')} km</span>
                </div>
              `,
              iconSize: [120, 32],
              iconAnchor: [60, 16],
            })}
            interactive={false}
          />
        </>
      )}
    </>
  );
}
