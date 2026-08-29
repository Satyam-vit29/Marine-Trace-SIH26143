/**
 * Geospatial utility functions for OilWatch Maritime Intelligence Platform
 */

// Haversine distance in kilometers between two lat/lon coordinates
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert decimal degrees to formatted DMS / Nautical string
export function formatCoordinates(lat, lon, format = 'nautical') {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return '--';

  if (format === 'decimal') {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  }

  // Nautical DMS format (e.g., 18° 28' 07" N, 069° 52' 52" E)
  const formatDMS = (val, isLat) => {
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.round((minFloat - min) * 60);
    const degPad = isLat ? String(deg).padStart(2, '0') : String(deg).padStart(3, '0');
    return `${degPad}° ${String(min).padStart(2, '0')}' ${String(sec).padStart(2, '0')}" ${dir}`;
  };

  return `${formatDMS(lat, true)}, ${formatDMS(lon, false)}`;
}

// Compute Closest Point of Approach (CPA) between a vessel track and a target point (e.g. Origin)
export function findClosestPointOfApproach(track, targetLat, targetLon) {
  if (!track || track.length === 0) return null;

  let minDistance = Infinity;
  let closestPoint = null;
  let closestIndex = -1;

  track.forEach((pt, index) => {
    const dist = haversineDistanceKm(pt.lat, pt.lon, targetLat, targetLon);
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = pt;
      closestIndex = index;
    }
  });

  return {
    point: closestPoint,
    distanceKm: minDistance,
    index: closestIndex,
  };
}

// Calculate centroid and dispersion of particles at a given time step
export function calculateParticleMetrics(latArray, lonArray, timeIndex) {
  if (!latArray || !lonArray || latArray.length === 0) return null;

  let sumLat = 0;
  let sumLon = 0;
  let validCount = 0;
  const points = [];

  for (let i = 0; i < latArray.length; i++) {
    const lat = latArray[i]?.[timeIndex];
    const lon = lonArray[i]?.[timeIndex];
    if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
      sumLat += lat;
      sumLon += lon;
      points.push([lat, lon]);
      validCount++;
    }
  }

  if (validCount === 0) return null;

  const centroid = [sumLat / validCount, sumLon / validCount];

  // Calculate standard deviation / radius of dispersion
  let sumDistSq = 0;
  points.forEach(([pLat, pLon]) => {
    const d = haversineDistanceKm(centroid[0], centroid[1], pLat, pLon);
    sumDistSq += d * d;
  });
  const stdDevKm = Math.sqrt(sumDistSq / validCount);
  const estimatedSpreadKm = stdDevKm * 2; // ~95% confidence radius

  return {
    centroid,
    particleCount: validCount,
    stdDevKm,
    estimatedSpreadKm,
    points,
  };
}

// Calculate speed and bearing from Cartesian (u, v) velocity components
export function calculateVectorMagnitudeAndBearing(u, v) {
  const speed = Math.sqrt(u * u + v * v);
  let bearingRad = Math.atan2(u, v);
  let bearingDeg = (bearingRad * 180) / Math.PI;
  if (bearingDeg < 0) bearingDeg += 360;

  return {
    speed: parseFloat(speed.toFixed(2)),
    speedKnots: parseFloat((speed * 1.94384).toFixed(2)),
    bearingDeg: Math.round(bearingDeg),
    bearingCardinal: getCardinalDirection(bearingDeg),
  };
}

export function getCardinalDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

// Candidate Vessel Color and Assessment Level utilities
export function getVesselColor(score) {
  if (score >= 80) return '#e11d48'; // Rose - High association
  if (score >= 50) return '#d97706'; // Amber - Moderate association
  if (score > 0) return '#0284c7';  // Blue - Low association
  return '#64748b';                  // Slate - Out of corridor
}

export function getVesselAssessment(score) {
  if (score >= 80) return { label: 'HIGH ASSOCIATION', tier: 'high', color: '#e11d48' };
  if (score >= 50) return { label: 'MODERATE ASSOCIATION', tier: 'med', color: '#d97706' };
  if (score > 0) return { label: 'LOW ASSOCIATION', tier: 'low', color: '#0284c7' };
  return { label: 'OUT OF CORRIDOR', tier: 'none', color: '#64748b' };
}
