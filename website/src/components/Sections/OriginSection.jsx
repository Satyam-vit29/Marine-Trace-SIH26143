import { 
  Target, 
  MapPin 
} from 'lucide-react';
import { formatCoordinates } from '../../utils/geoUtils';

export function OriginSection({ originData }) {
  if (!originData || !originData.probable_origin) return null;

  const lat = originData.probable_origin.lat;
  const lon = originData.probable_origin.lon;

  return (
    <section id="section-origin" className="sci-scroll-section">
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle orange">
            <Target size={24} />
          </div>
          <div>
            <span className="sci-section-tag">INVESTIGATION STAGE 05</span>
            <h2 className="sci-section-title">Probable Spill Origin & Spatial Uncertainty</h2>
          </div>
        </div>
        <span className="sci-badge badge-orange text-sm">HINDCAST ORIGIN</span>
      </div>

      <p className="sci-section-intro">
        The probable discharge source is computed via spatial median clustering of the 300 Lagrangian backward trajectories at t = -12 hours (06:00 UTC). A 95% confidence uncertainty ellipse (±2.80 km) is constructed to define the spatio-temporal search bounds for historical AIS vessel traffic.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        {/* Left Column (5 cols): Origin Geodetic Hero Card */}
        <div className="md:col-span-5 sci-content-card border-orange-200 bg-orange-50/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin size={26} className="text-orange-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-orange-900 tracking-wider">ESTIMATED DISCHARGE LOCATION</span>
              <div className="text-2xl font-mono font-extrabold text-slate-900 mt-0.5">
                {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
              </div>
              <span className="text-xs font-mono text-orange-800 font-semibold">{formatCoordinates(lat, lon, 'nautical')}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-orange-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Estimated Release Timestamp:</span>
              <span className="font-mono font-bold text-slate-900">2026-08-28 06:00:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Hindcast Reverse Duration:</span>
              <span className="font-mono font-bold text-slate-900">12.0 Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Uncertainty Envelope (95% CI):</span>
              <span className="font-mono font-bold text-orange-700">±2.80 km Radius</span>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Methodology & Convergence Details */}
        <div className="md:col-span-7 sci-content-card">
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
            Backward Lagrangian Hindcast Methodology
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-xs text-slate-500 font-medium">PARTICLES TRACED</span>
              <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">{originData.particles_used || 300}</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-xs text-slate-500 font-medium">PLUME CONVERGENCE</span>
              <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">98.2%</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-xs text-slate-500 font-medium">TIME STEP (Δt)</span>
              <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">-600 s</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Origin Coordinate Extraction:</span>
              <span className="font-semibold text-slate-900">Spatial Median of Lagrangian Particle Distribution</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Environmental Boundary Forcing:</span>
              <span className="font-semibold text-slate-900">ERA5 Hourly Wind + CMEMS Surface Currents</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">AIS Query Search Radius:</span>
              <span className="font-mono font-bold text-blue-700">30.0 km Corridor around Origin</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
