import { 
  X, 
  Database, 
  Satellite, 
  Wind, 
  Ship, 
  Target, 
  FileCode,
  Info
} from 'lucide-react';

export function DataProvenanceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container provenance-modal-light" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap blue">
              <Database size={20} />
            </div>
            <div>
              <div className="modal-pre-title">SCIENTIFIC TRANSPARENCY & PROVENANCE</div>
              <h2 className="modal-title">Data Sources & Model Architecture</h2>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-xs text-slate-600 leading-relaxed">
            In compliance with technical integrity guidelines, the exact data sources, simulation physics engines, and synthetic demonstration inputs used in this SIH26143 prototype are detailed below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Satellite Observation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Satellite size={15} className="text-blue-600" />
                  <span>Satellite SAR Observation</span>
                </div>
                <span className="sci-tag tag-cyan">DEMO INPUT</span>
              </div>
              <p className="text-xs text-slate-600">
                Synthetic Sentinel-1 C-SAR IW mode anomaly footprint at <code>18.5000° N, 70.0000° E</code> providing initial slick geometry (10.38 km²).
              </p>
            </div>

            {/* 2. Drift Engine */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <FileCode size={15} className="text-teal-600" />
                  <span>Drift Model: OpenDrift / OpenOil</span>
                </div>
                <span className="sci-tag tag-verified">REAL ENGINE</span>
              </div>
              <p className="text-xs text-slate-600">
                Executed via the official <strong>OpenDrift / OpenOil</strong> Python Lagrangian trajectory framework (300 particles over 24h forward and 12h backward runs).
              </p>
            </div>

            {/* 3. Atmospheric Wind */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Wind size={15} className="text-blue-600" />
                  <span>ERA5 Atmospheric Wind (10m)</span>
                </div>
                <span className="sci-tag tag-verified">COPERNICUS CDS</span>
              </div>
              <p className="text-xs text-slate-600">
                Copernicus Climate Data Store (CDS) ERA5 hourly single-level u₁₀ and v₁₀ wind components (3.29 m/s at 71.8°).
              </p>
            </div>

            {/* 4. Ocean Currents */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Wind size={15} className="text-teal-600" />
                  <span>Copernicus Marine Surface Currents</span>
                </div>
                <span className="sci-tag tag-verified">CMEMS GLOBAL</span>
              </div>
              <p className="text-xs text-slate-600">
                Copernicus Marine Service (CMEMS) Global Ocean surface velocity vectors u and v (0.21 m/s at 76.1°).
              </p>
            </div>

            {/* 5. Origin Estimation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Target size={15} className="text-orange-600" />
                  <span>Probable Origin Estimation</span>
                </div>
                <span className="sci-tag tag-verified">MODEL OUTPUT</span>
              </div>
              <p className="text-xs text-slate-600">
                Median backward hindcast point (18.4686° N, 69.8812° E) with 95% confidence uncertainty envelope (±2.80 km).
              </p>
            </div>

            {/* 6. AIS Vessel Traffic */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Ship size={15} className="text-rose-600" />
                  <span>AIS Vessel Traffic Corridors</span>
                </div>
                <span className="sci-tag tag-cyan">ACCESSAIS SCHEMA</span>
              </div>
              <p className="text-xs text-slate-600">
                Simulated marine corridors structured according to MarineCadastre AccessAIS schema, filtered through spatio-temporal bounding funnels (127 → 23 → 8 → 5).
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-900 leading-relaxed">
              <strong>Production Readiness:</strong> The Python pipeline is architected to ingest live Sentinel-1 Level-1 GRD SAR rasters, CMEMS hourly current feeds, and real-time terrestrial/satellite AIS feeds.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="sci-btn btn-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
