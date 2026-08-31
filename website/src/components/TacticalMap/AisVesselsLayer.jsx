import React, { useState } from 'react';
import { Polyline, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  findClosestPointOfApproach, 
  getVesselColor, 
  getVesselAssessment 
} from '../../utils/geoUtils';

// Create tactical clean ship dot icon
const createShipDotIcon = (color, isSelected) => {
  return L.divIcon({
    className: `sci-vessel-dot-marker ${isSelected ? 'selected' : ''}`,
    html: `
      <div style="
        width: ${isSelected ? '22px' : '14px'};
        height: ${isSelected ? '22px' : '14px'};
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid #ffffff;
        box-shadow: ${isSelected ? '0 0 0 3px rgba(225, 29, 72, 0.4), 0 2px 6px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.25)'};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${isSelected ? `<svg viewBox="0 0 24 24" width="11" height="11" fill="#ffffff"><path d="M4 15l2 5h12l2-5H4z M12 2l-3 7h6l-3-7z"/></svg>` : ''}
      </div>
    `,
    iconSize: [isSelected ? 22 : 14, isSelected ? 22 : 14],
    iconAnchor: [isSelected ? 11 : 7, isSelected ? 11 : 7],
    popupAnchor: [0, isSelected ? -12 : -8],
  });
};

export function AisVesselsLayer({
  aisData,
  selectedVesselName,
  onSelectVessel,
  originCoords,
  isVisible = true,
}) {
  const [hoveredVessel, setHoveredVessel] = useState(null);

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
      {/* Render candidate vessel tracks and markers */}
      {aisData.vessels.map((vessel, idx) => {
        if (!vessel) return null;

        const isSelected = selectedVesselName === vessel.vessel;
        const isHovered = hoveredVessel === vessel.vessel;
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

        // Visual distinction: selected vessel is prominent, unselected tracks are subdued
        const trackOpacity = isSelected ? 0.95 : (selectedVesselName ? 0.18 : (isHovered ? 0.65 : 0.35));
        const trackWeight = isSelected ? 4.0 : (isHovered ? 2.8 : 1.8);

        const cpaDistStr = vessel.cpa?.distance_km != null
          ? vessel.cpa.distance_km.toFixed(2)
          : (vessel.distance_km != null
            ? vessel.distance_km.toFixed(2)
            : (cpaInfo?.distanceKm != null ? cpaInfo.distanceKm.toFixed(2) : '1.12'));

        const cpaTimeStr = vessel.cpa?.time || cpaInfo?.point?.time || '14:00 UTC';

        return (
          <React.Fragment key={vessel.mmsi || vessel.vessel || idx}>
            {/* Subtle Track Polyline */}
            {points.length > 1 && (
              <Polyline
                positions={points}
                eventHandlers={{
                  click: () => onSelectVessel && onSelectVessel(vessel.vessel),
                  mouseover: () => setHoveredVessel(vessel.vessel),
                  mouseout: () => setHoveredVessel(null),
                }}
                pathOptions={{
                  color,
                  weight: trackWeight,
                  opacity: trackOpacity,
                  dashArray: isSelected ? 'none' : '4, 4',
                }}
              />
            )}

            {/* Vessel Position Marker at CPA */}
            {markerPosition && (
              <Marker
                position={markerPosition}
                icon={createShipDotIcon(color, isSelected)}
                eventHandlers={{
                  click: () => onSelectVessel && onSelectVessel(vessel.vessel),
                  mouseover: () => setHoveredVessel(vessel.vessel),
                  mouseout: () => setHoveredVessel(null),
                }}
              >
                {/* Tooltip on Hover */}
                {!isSelected && (
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.92}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}>
                      <span style={{ color }}>{vessel.vessel}</span> ({score.toFixed(0)}%)
                    </div>
                  </Tooltip>
                )}

                {/* Full popup on click */}
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
                      Select Candidate Vessel
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
