/**
 * Scientific & Environmental Constants for Marine Trace Platform
 * Supporting Two Distinct Demonstration Cases:
 * Case A — Bay of Bengal (Eastern Coastline)
 * Case B — Arabian Sea (Western Coastline)
 */

export const DEMO_CASES = {
  CASE_A: {
    id: 'CASE_A',
    key: 'CASE_A',
    badgeText: 'CASE A — BAY OF BENGAL',
    name: 'Bay of Bengal Demonstration Case',
    regionShort: 'Bay of Bengal',
    regionFull: 'Bay of Bengal (Offshore Kakinada / Godavari Basin)',
    coastline: 'Eastern Coastline of India',
    incidentId: 'DEMO-BOB-001',
    detectionTime: '2026-08-28 14:30:00 UTC',
    estimatedReleaseTime: '2026-08-28 02:30:00 UTC',
    satelliteSensor: 'Sentinel-1A C-SAR',
    defaultCenter: [16.46, 82.72],
    defaultZoom: 10.0,
    spillCenter: { lat: 16.5000, lon: 82.8000 },
    originCenter: { lat: 16.3820, lon: 82.6180 },
    topVessel: 'MV Konkan Pride',
    dataPath: '/data/case_a',
  },
  CASE_B: {
    id: 'CASE_B',
    key: 'CASE_B',
    badgeText: 'CASE B — ARABIAN SEA',
    name: 'Arabian Sea Demonstration Case',
    regionShort: 'Arabian Sea',
    regionFull: 'Arabian Sea (Offshore Mumbai / Konkan Coast)',
    coastline: 'Western Coastline of India',
    incidentId: 'DEMO-AS-002',
    detectionTime: '2026-08-28 18:00:00 UTC',
    estimatedReleaseTime: '2026-08-28 06:00:00 UTC',
    satelliteSensor: 'Sentinel-1A C-SAR',
    defaultCenter: [18.48, 69.95],
    defaultZoom: 10.0,
    spillCenter: { lat: 18.5000, lon: 70.0000 },
    originCenter: { lat: 18.4686, lon: 69.8812 },
    topVessel: 'MT Ratnagiri Voyager',
    dataPath: '/data/case_b',
  },
};

// Function to generate 7-Stage Workflow Pipeline tailored for active case
export function getWorkflowStages(caseKey = 'CASE_A') {
  const isCaseA = caseKey === 'CASE_A';
  const center = isCaseA ? [16.50, 82.80] : [18.50, 70.00];
  const originCenter = isCaseA ? [16.3820, 82.6180] : [18.4686, 69.8812];
  const highlightVessel = isCaseA ? 'MV Konkan Pride' : 'MT Ratnagiri Voyager';

  return [
    {
      id: 'SATELLITE',
      number: '01',
      title: 'DETECT',
      subtitle: 'Sentinel-1 SAR',
      description: isCaseA 
        ? 'Sentinel-1 C-SAR observation over Bay of Bengal captures dark low-backscatter oil slick anomaly at 16.5000° N, 82.8000° E.' 
        : 'Sentinel-1 C-SAR observation over Arabian Sea captures dark low-backscatter oil slick anomaly at 18.5000° N, 70.0000° E.',
      layers: {
        sarImage: true,
        satellite: true,
        spill: true,
        forward: false,
        backward: false,
        currents: false,
        wind: false,
        vessels: false,
        origin: false,
      },
      mode: 'forward',
      zoom: 10.8,
      center: center,
    },
    {
      id: 'CHARACTERIZE',
      number: '02',
      title: 'CHARACTERIZE',
      subtitle: 'Slick Geometry',
      description: isCaseA 
        ? 'Morphometrics derived: 12.45 km² surface area, 15.20 km perimeter, 6.80 km major axis along 045° NE drift alignment.' 
        : 'Morphometrics derived: 10.38 km² surface area, 13.91 km perimeter, 6.22 km major axis along 090.8° ENE drift alignment.',
      layers: {
        sarImage: true,
        satellite: true,
        spill: true,
        forward: false,
        backward: false,
        currents: false,
        wind: false,
        vessels: false,
        origin: false,
      },
      mode: 'forward',
      zoom: 11.0,
      center: center,
    },
    {
      id: 'ENVIRONMENT',
      number: '03',
      title: 'ENVIRONMENT',
      subtitle: 'ERA5 + CMEMS',
      description: isCaseA 
        ? 'Coupled forcing: ERA5 wind (4.12 m/s @ 042.5° NE) + CMEMS current (0.28 m/s @ 038° NE) along East India Coast.' 
        : 'Coupled forcing: ERA5 wind (3.29 m/s @ 071.8° ENE) + CMEMS current (0.21 m/s @ 076.1° ENE) along Konkan Coast.',
      layers: {
        sarImage: true,
        satellite: false,
        spill: true,
        forward: false,
        backward: false,
        currents: true,
        wind: true,
        vessels: false,
        origin: false,
      },
      mode: 'forward',
      zoom: 10.0,
      center: isCaseA ? [16.48, 82.75] : [18.50, 70.05],
    },
    {
      id: 'FORECAST',
      number: '04',
      title: 'DRIFT',
      subtitle: 'Forward Forecast',
      description: '300 Lagrangian particles advected +24 hours into the future under coupled hydrodynamic forcing.',
      layers: {
        sarImage: true,
        satellite: false,
        spill: true,
        forward: true,
        backward: false,
        currents: true,
        wind: true,
        vessels: false,
        origin: false,
      },
      mode: 'forward',
      zoom: 9.6,
      center: isCaseA ? [16.56, 82.88] : [18.55, 70.15],
    },
    {
      id: 'HINDCAST',
      number: '05',
      title: 'ORIGIN',
      subtitle: 'Backward Hindcast',
      description: 'Reverse Lagrangian transport -12 hours backwards to estimate discharge origin and ±2.80 km uncertainty zone.',
      layers: {
        sarImage: true,
        satellite: false,
        spill: true,
        forward: false,
        backward: true,
        currents: true,
        wind: true,
        vessels: false,
        origin: true,
      },
      mode: 'backward',
      zoom: 10.0,
      center: isCaseA ? [16.44, 82.70] : [18.48, 69.94],
    },
    {
      id: 'CORRELATE',
      number: '06',
      title: 'AIS',
      subtitle: 'Historic Traffic',
      description: 'Filter regional historical AIS transponder logs across spatial bounding box and 12-hour temporal hindcast window.',
      layers: {
        sarImage: true,
        satellite: false,
        spill: true,
        forward: false,
        backward: true,
        currents: true,
        wind: true,
        vessels: true,
        origin: true,
      },
      mode: 'backward',
      zoom: 9.6,
      center: isCaseA ? [16.42, 82.65] : [18.45, 69.85],
    },
    {
      id: 'ATTRIBUTE',
      number: '07',
      title: 'ATTRIBUTE',
      subtitle: 'Candidate Ranking',
      description: `Rank potential candidate vessels using CPA proximity to origin: #1 ${highlightVessel} scored highest.`,
      layers: {
        sarImage: true,
        satellite: false,
        spill: true,
        forward: false,
        backward: true,
        currents: true,
        wind: true,
        vessels: true,
        origin: true,
      },
      mode: 'backward',
      zoom: 10.5,
      center: originCenter,
      highlightVessel: highlightVessel,
    },
  ];
}

export const SCIENTIFIC_WORKFLOW_STAGES = getWorkflowStages('CASE_A');
