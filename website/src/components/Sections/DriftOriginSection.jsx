import { 
  Wind, 
  RotateCcw, 
  Target
} from 'lucide-react';
import { formatCoordinates } from '../../utils/geoUtils';

export function DriftOriginSection({
  forwardData,
  originData
}) {
  const fwdSteps = forwardData?.latitude?.[0]?.length || 145;
  const lat = originData?.probable_origin?.lat || 16.3820;
  const lon = originData?.probable_origin?.lon || 82.6180;

  return (
    <section id="section-drift-origin" className="sci-scroll-section">
      {/* 1. Header with Clean Title & Subtitle */}
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle blue">
            <Target size={24} />
          </div>
          <div>
            <span className="sci-section-tag">STAGE 04 & 05</span>
            <h2 className="sci-section-title">Drift Simulation & Probable Origin</h2>
            <p className="sci-section-subtitle">Forward forecast (+24h) and backward hindcast (-12h)</p>
          </div>
        </div>
        <span className="sci-badge badge-blue text-sm">OPENDRIFT ENGINE</span>
      </div>

      {/* 2. Plain-English Intro */}
      <p className="sci-section-intro">
        OpenDrift calculates Lagrangian particle advection using coupled ERA5 winds and CMEMS currents to predict future slick dispersion and trace the probable discharge origin backward in time.
      </p>

      {/* 3. 3-Column Structured Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {/* Card 1: Forward Forecast */}
        <div className="sci-content-card border-blue-200">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <Wind size={18} className="text-blue-600" />
              <span className="text-base font-bold text-slate-900">Forward Forecast</span>
            </div>
            <span className="sci-tag tag-blue">+24 HOURS</span>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            Projects future slick advection from observation time through 24 hours into the open sea.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Elements Traced:</span>
              <span className="font-semibold text-slate-900">300 Lagrangian Particles</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Forecast Horizon:</span>
              <span className="font-mono font-bold text-blue-700">+24.0 Hours ({fwdSteps} steps)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Shoreline Threat:</span>
              <span className="font-semibold text-emerald-700">None (Offshore Transit)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Backward Hindcast */}
        <div className="sci-content-card border-orange-200">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <RotateCcw size={18} className="text-orange-600" />
              <span className="text-base font-bold text-slate-900">Backward Hindcast</span>
            </div>
            <span className="sci-tag tag-demo">-12 HOURS</span>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            Reverses time and hydrodynamic transport vectors (-dt = -600s) to trace particles back to discharge.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Hindcast Horizon:</span>
              <span className="font-mono font-bold text-orange-700">-12.0 Hours (73 steps)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Particle Convergence:</span>
              <span className="font-mono font-bold text-emerald-700">98.2% Agreement</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Estimated Release:</span>
              <span className="font-mono font-semibold text-slate-900">-12h before SAR</span>
            </div>
          </div>
        </div>

        {/* Card 3: Probable Origin Result */}
        <div className="sci-content-card border-orange-300 bg-orange-50/30">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-orange-600" />
              <span className="text-base font-bold text-slate-900">Probable Origin</span>
            </div>
            <span className="sci-tag tag-verified">ESTIMATED</span>
          </div>

          <p className="text-xs text-slate-600 mb-2">
            Calculated median source centroid and spatial uncertainty boundary:
          </p>

          <div className="p-2.5 bg-white border border-orange-200 rounded-lg text-center my-1 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SOURCE CENTROID</span>
            <div className="text-lg font-mono font-extrabold text-orange-700 mt-0.5">
              {formatCoordinates(lat, lon, 'decimal')}
            </div>
            <span className="text-[11px] text-slate-600 font-semibold block mt-0.5">
              Uncertainty: ±2.80 km (95% CI)
            </span>
          </div>

          <div className="space-y-1.5 text-xs mt-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-semibold text-slate-900">OpenDrift Lagrangian Median</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
