import { 
  Wind, 
  RotateCcw, 
  Activity 
} from 'lucide-react';

export function DriftModelingSection({
  forwardData
}) {
  const fwdSteps = forwardData?.latitude?.[0]?.length || 145;

  return (
    <section id="section-drift" className="sci-scroll-section">
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle blue">
            <Activity size={24} />
          </div>
          <div>
            <span className="sci-section-tag">INVESTIGATION STAGE 04 & 05</span>
            <h2 className="sci-section-title">Lagrangian Particle Drift Modeling (OpenOil / OpenDrift)</h2>
          </div>
        </div>
        <span className="sci-badge badge-blue text-sm">OPENDRIFT ENGINE</span>
      </div>

      <p className="sci-section-intro">
        The OpenDrift / OpenOil trajectory framework solves the Lagrangian equations of motion for 300 individual oil particles under the combined influence of ERA5 winds and CMEMS currents. The platform executes both forward prognostic forecasting (+24h) and backward hindcasting (-12h).
      </p>

      {/* 2-Column Comparison: Forward Forecast vs Backward Hindcast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Forward Forecast Card */}
        <div className="sci-content-card border-blue-200">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <Wind size={20} className="text-blue-600" />
              <span className="text-base font-bold text-slate-900">Forward Prognostic Forecast (+24 Hours)</span>
            </div>
            <span className="sci-tag tag-blue">FUTURE DRIFT</span>
          </div>

          <p className="text-sm text-slate-600 mt-2">
            Simulates future slick movement and shoreline threat envelope from initial detection time (2026-08-28 12:00 UTC) through 24 hours (2026-08-29 12:00 UTC).
          </p>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">HORIZON</span>
              <div className="text-lg font-mono font-bold text-blue-600">+24.0 h</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">ELEMENTS</span>
              <div className="text-lg font-mono font-bold text-slate-900">300 pts</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">TIMESTEPS</span>
              <div className="text-lg font-mono font-bold text-slate-900">{fwdSteps} steps</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Net Drift Displacement:</span>
              <span className="font-mono font-bold text-slate-900">~26.8 km East-Northeast</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Plume Spreading Radius:</span>
              <span className="font-mono font-bold text-slate-900">Expanding from 1.4 km to 4.8 km</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Shoreline Impact Risk:</span>
              <span className="font-semibold text-emerald-700">Zero (Offshore transit in open sea)</span>
            </div>
          </div>
        </div>

        {/* Backward Hindcast Card */}
        <div className="sci-content-card border-orange-200">
          <div className="sci-card-inner-header">
            <div className="flex items-center gap-2">
              <RotateCcw size={20} className="text-orange-600" />
              <span className="text-base font-bold text-slate-900">Backward Origin Hindcast (-12 Hours)</span>
            </div>
            <span className="sci-tag tag-demo">ORIGIN TRACING</span>
          </div>

          <p className="text-sm text-slate-600 mt-2">
            Reverses time and hydrodynamic transport vectors (-dt = -600s) from detection time (18:00 UTC) backwards 12 hours to 06:00 UTC to pinpoint discharge origin.
          </p>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">HORIZON</span>
              <div className="text-lg font-mono font-bold text-orange-600">-12.0 h</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">CONVERGENCE</span>
              <div className="text-lg font-mono font-bold text-emerald-700">98.2%</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
              <span className="text-xs text-slate-500 font-medium">UNCERTAINTY</span>
              <div className="text-lg font-mono font-bold text-slate-900">±2.8 km</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Reverse Trajectory Origin:</span>
              <span className="font-mono font-bold text-orange-700">18.4686° N, 69.8812° E</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Estimated Discharge Time:</span>
              <span className="font-mono font-bold text-slate-900">2026-08-28 06:00:00 UTC</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Integration with AIS:</span>
              <span className="font-semibold text-blue-700">Feeds directly to AIS Correlation Funnel</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
