import { useMemo } from 'react';
import { Polyline, CircleMarker, Circle, Popup } from 'react-leaflet';
import { calculateParticleMetrics, formatCoordinates } from '../../utils/geoUtils';

export function ParticleFieldLayer({
  data,
  mode = 'forward', // 'forward' | 'backward'
  isVisible = true,
  timeIndex = 0,
  showTrails = true,
  showDensity = true,
}) {
  const particleCount = data?.latitude?.length || 0;
  const totalTimeSteps = data?.latitude?.[0]?.length || 1;
  const clampedTimeIndex = Math.max(0, Math.min(timeIndex, totalTimeSteps - 1));

  const isForward = mode === 'forward';
  
  // High-contrast, bright luminous color palette optimized specifically over grayscale Sentinel-1 SAR imagery
  const primaryColor = isForward ? '#00e5ff' : '#ff6d00';       // Active front particles: Bright Luminous Cyan vs Bright Warm Orange
  const outerColor = isForward ? '#38bdf8' : '#fb923c';         // Outer particles: Saturated tint
  const centroidColor = isForward ? '#00f5ff' : '#ff5722';      // Centroid: Maximum focal luminance
  const trailColor = isForward ? '#06b6d4' : '#f97316';         // Streamline trajectories: Bright, visible Cyan/Orange ribbon (never dark/dull)
  const envelopeColor = isForward ? '#06b6d4' : '#f97316';      // Plume dispersion envelope boundary

  // Calculate live centroid & plume dispersion at current time step
  const plumeMetrics = useMemo(() => {
    if (!data || !data.latitude || !data.longitude) return null;
    return calculateParticleMetrics(data.latitude, data.longitude, clampedTimeIndex);
  }, [data, clampedTimeIndex]);

  // Current particle positions at this exact time step
  const currentPositions = useMemo(() => {
    if (!data || !data.latitude || !data.longitude) return [];
    const pts = [];
    for (let i = 0; i < particleCount; i++) {
      const lat = data.latitude[i]?.[clampedTimeIndex];
      const lon = data.longitude[i]?.[clampedTimeIndex];
      if (lat != null && lon != null) {
        pts.push({ id: i, lat, lon });
      }
    }
    return pts;
  }, [data, clampedTimeIndex, particleCount]);

  // Sampled streamlines (Historical trajectory paths)
  const streamlines = useMemo(() => {
    if (!data || !data.latitude || !data.longitude || !showTrails) return [];
    const lines = [];
    const step = Math.max(1, Math.floor(particleCount / 35));

    for (let i = 0; i < particleCount; i += step) {
      const path = [];
      const endStep = isForward ? clampedTimeIndex + 1 : totalTimeSteps;
      for (let t = 0; t < Math.min(totalTimeSteps, endStep); t++) {
        const lat = data.latitude[i]?.[t];
        const lon = data.longitude[i]?.[t];
        if (lat != null && lon != null) {
          path.push([lat, lon]);
        }
      }
      if (path.length > 1) {
        lines.push({ id: i, path });
      }
    }
    return lines;
  }, [data, showTrails, particleCount, totalTimeSteps, clampedTimeIndex, isForward]);

  if (!isVisible || !data || !data.latitude || !data.longitude) return null;

  return (
    <>
      {/* 1. Dynamic Plume Dispersion Envelope */}
      {showDensity && plumeMetrics && (
        <>
          <Circle
            center={plumeMetrics.centroid}
            radius={plumeMetrics.estimatedSpreadKm * 1000}
            pathOptions={{
              color: envelopeColor,
              weight: 2.0,
              dashArray: '4, 4',
              fillColor: isForward ? '#00e5ff' : '#ff6d00',
              fillOpacity: isForward ? 0.16 : 0.18,
            }}
          />
          {/* Active Centroid Marker with White Halo Ring */}
          <CircleMarker
            center={plumeMetrics.centroid}
            radius={7.5}
            pathOptions={{
              color: '#ffffff',
              weight: 3.0,
              fillColor: centroidColor,
              fillOpacity: 1.0,
            }}
          >
            <Popup className="tactical-leaflet-popup">
              <div className="p-3 font-mono text-xs text-slate-800 space-y-1">
                <div className="font-bold text-blue-900 mb-1">
                  {isForward ? 'FORWARD FORECAST CENTROID' : 'HINDCAST REVERSE CENTROID'}
                </div>
                <div>Step: {clampedTimeIndex} / {totalTimeSteps - 1}</div>
                <div>Centroid: {formatCoordinates(plumeMetrics.centroid[0], plumeMetrics.centroid[1], 'decimal')}</div>
                <div>Active Particles: {plumeMetrics.particleCount}</div>
                <div>Spread Radius: ~{plumeMetrics.estimatedSpreadKm.toFixed(2)} km</div>
              </div>
            </Popup>
          </CircleMarker>
        </>
      )}

      {/* 2. Streamline Trajectory Paths (Bright, clearly visible advection ribbon) */}
      {streamlines.map((line) => (
        <Polyline
          key={`stream-${mode}-${line.id}`}
          positions={line.path}
          pathOptions={{
            color: trailColor,
            weight: 2.8,
            opacity: isForward ? 0.65 : 0.70,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ))}

      {/* 3. Lagrangian Particle Dots (Enlarged active front with crisp white contrast halo) */}
      {currentPositions.map((pt, idx) => {
        const isCore = idx % 2 === 0;
        return (
          <CircleMarker
            key={`pt-${mode}-${pt.id}`}
            center={[pt.lat, pt.lon]}
            radius={isCore ? 4.8 : 3.6}
            pathOptions={{
              color: '#ffffff',
              weight: isCore ? 1.4 : 1.1,
              fillColor: isCore ? primaryColor : outerColor,
              fillOpacity: 1.0,
            }}
          />
        );
      })}
    </>
  );
}
