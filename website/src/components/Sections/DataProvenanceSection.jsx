import { 
  Database, 
  Satellite, 
  Wind, 
  Ship, 
  Target, 
  FileCode 
} from 'lucide-react';

export function DataProvenanceSection() {
  const provenanceItems = [
    {
      title: 'Satellite Remote Sensing',
      source: 'Sentinel-1A C-SAR / Demonstration',
      typeTag: 'tag-cyan',
      icon: <Satellite size={18} className="text-blue-600" />,
      description: 'Level-1 GRD SAR grayscale amplitude radar scene (10m resolution) displaying capillary wave damping (Δσ₀ = -4.8 dB).'
    },
    {
      title: 'Atmospheric Wind Forcing',
      source: 'Copernicus CDS ERA5 Reanalysis',
      typeTag: 'tag-verified',
      icon: <Wind size={18} className="text-blue-600" />,
      description: 'Hourly single-level 10m u₁₀ and v₁₀ atmospheric wind fields (0.25° grid) coupled into particle drift.'
    },
    {
      title: 'Ocean Surface Hydrodynamics',
      source: 'Copernicus Marine (CMEMS)',
      typeTag: 'tag-verified',
      icon: <Wind size={18} className="text-teal-600" />,
      description: 'Global ocean surface eastward (u) and northward (v) velocity vectors (0.083° ~9km horizontal grid).'
    },
    {
      title: 'Lagrangian Drift Physics Engine',
      source: 'OpenDrift / OpenOil Framework',
      typeTag: 'tag-verified',
      icon: <FileCode size={18} className="text-teal-600" />,
      description: 'Official Python Lagrangian trajectory model tracking 300 particles over +24h forecast and -12h backward hindcast.'
    },
    {
      title: 'Probable Discharge Origin',
      source: 'OpenDrift Spatial Median',
      typeTag: 'tag-verified',
      icon: <Target size={18} className="text-orange-600" />,
      description: 'Derived from spatial median cluster of 300 hindcast particles at t = -12h (18.4686°N, 69.8812°E ±2.80km).'
    },
    {
      title: 'Historical AIS Vessel Traffic',
      source: 'MarineCadastre AccessAIS / Simulated',
      typeTag: 'tag-cyan',
      icon: <Ship size={18} className="text-rose-600" />,
      description: 'Candidate tracks formatted strictly to US MarineCadastre AccessAIS schema. Ranked by proximity to origin.'
    }
  ];

  return (
    <section id="section-provenance" className="sci-scroll-section mb-12">
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle blue">
            <Database size={24} />
          </div>
          <div>
            <span className="sci-section-tag">DATA SOURCES & ARCHITECTURE</span>
            <h2 className="sci-section-title">Technical Provenance & Data Sources</h2>
          </div>
        </div>
        <span className="sci-badge badge-blue text-sm">TRANSPARENCY</span>
      </div>

      <p className="sci-section-intro">
        In compliance with Smart India Hackathon technical integrity standards, the exact status and provenance of each data layer and simulation engine in this Marine Trace prototype is disclosed below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {provenanceItems.map((item, idx) => (
          <div key={idx} className="sci-content-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-bold text-xs text-slate-900">{item.title}</span>
                </div>
                <span className={`sci-tag ${item.typeTag}`}>{item.source.split('/')[0]}</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mb-1">{item.source}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
