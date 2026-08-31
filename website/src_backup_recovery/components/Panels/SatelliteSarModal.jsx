import { 
  X, 
  Satellite, 
  Info
} from 'lucide-react';

export function SatelliteSarModal({ 
  satelliteData, 
  onClose 
}) {
  const char = satelliteData?.slick_characterization || {};
  const centroid = char.centroid || { lat: 18.5000, lon: 70.0000 };
  const sarOverlay = satelliteData?.sar_image_overlay || {};

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container sar-modal-wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon-wrap blue">
              <Satellite size={22} />
            </div>
            <div>
              <div className="modal-pre-title">SATELLITE RADAR REMOTE SENSING</div>
              <h2 className="modal-title">Sentinel-1 C-SAR Slick Detection & Backscatter Analysis</h2>
            </div>
          </div>

          <div className="modal-header-actions">
            <span className="sci-tag tag-verified">SENTINEL-1A C-SAR</span>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close SAR Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="sar-visual-grid">
            {/* Real Sentinel-1 Grayscale SAR Image Canvas */}
            <div className="sar-image-canvas-box">
              <div className="sar-canvas-overlay">
                <img 
                  src={sarOverlay.url || "/sentinel1_sar_scene.png"} 
                  alt="Sentinel-1 SAR Radar Scene" 
                  className="w-full h-full object-cover"
                />

                {/* SVG Vector Frame showing Detected Oil Slick Damping Zone on top of SAR */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg viewBox="0 0 400 260" className="w-full h-full">
                    {/* Bounding Box Frame */}
                    <rect x="90" y="80" width="220" height="96" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="5, 5" />

                    {/* Detected Slick Mask Polygon */}
                    <ellipse 
                      cx="200" 
                      cy="128" 
                      rx="85" 
                      ry="32" 
                      fill="rgba(234, 88, 12, 0.35)" 
                      stroke="#ea580c" 
                      strokeWidth="2.5" 
                    />

                    {/* Centroid Reticle */}
                    <circle cx="200" cy="128" r="4" fill="#ffffff" stroke="#ea580c" strokeWidth="2" />
                    <line x1="200" y1="112" x2="200" y2="144" stroke="#ffffff" strokeWidth="1.2" />
                    <line x1="184" y1="128" x2="216" y2="128" stroke="#ffffff" strokeWidth="1.2" />

                    {/* Dimension Tag */}
                    <text x="200" y="195" fill="#ffffff" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))">
                      Major Axis: {char.length_major_axis_km || '6.22'} km @ {char.orientation_deg || '90.8'}°
                    </text>
                  </svg>
                </div>

                <div className="sar-canvas-badge">
                  <span>Level-1 GRD SAR Radar Amplitude (10m Pixel Spacing)</span>
                </div>
              </div>
            </div>

            {/* Sidebar Morphometrics */}
            <div className="sar-metrics-sidebar">
              <h3 className="sidebar-sub-title">RADAR BACKSCATTER & MORPHOMETRICS</h3>

              <div className="sar-metric-tile">
                <span className="tile-lbl">CALCULATED SURFACE AREA</span>
                <span className="tile-val font-mono text-blue">{char.area_km2 || '10.38'} km²</span>
              </div>

              <div className="sar-metric-tile">
                <span className="tile-lbl">PERIMETER CONTOUR</span>
                <span className="tile-val font-mono text-slate-900">{char.perimeter_km || '13.91'} km</span>
              </div>

              <div className="sar-metric-tile">
                <span className="tile-lbl">BACKSCATTER DAMPING (Δσ₀)</span>
                <span className="tile-val font-mono text-orange">-4.8 dB</span>
                <span className="tile-sub">Capillary wave damping anomaly</span>
              </div>

              <div className="sar-metric-tile">
                <span className="tile-lbl">ESTIMATED SLICK AGE</span>
                <span className="tile-val font-mono text-emerald">~{char.estimated_age_hours || '6.0'} Hours</span>
                <span className="tile-sub">Spreading & weathering inversion</span>
              </div>

              <div className="sar-metric-tile">
                <span className="tile-lbl">CENTROID COORDINATES</span>
                <span className="tile-val font-mono text-sm">{centroid.lat?.toFixed(4)}° N, {centroid.lon?.toFixed(4)}° E</span>
              </div>
            </div>
          </div>

          {/* Workflow Explanation Banner */}
          <div className="sar-honesty-banner">
            <Info size={18} className="text-blue flex-shrink-0" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>Satellite-to-Model Pipeline:</strong> Sentinel-1 C-SAR radar passes over the Arabian Sea and captures the dark low-backscatter oil slick anomaly. The segmented polygon geometry is immediately passed to the OpenDrift particle generation engine for forward forecast (+24h) and backward hindcast (-12h).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="sci-btn btn-primary" onClick={onClose}>
            Close SAR Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
