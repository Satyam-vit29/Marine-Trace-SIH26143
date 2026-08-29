import { Ship } from 'lucide-react';
import { getVesselColor, getVesselAssessment } from '../../utils/geoUtils';

export function AisCorrelationSection({
  vessels = [],
  selectedVesselName,
  onSelectVessel,
}) {
  return (
    <section id="section-ais" className="sci-scroll-section">
      {/* 1. Simplified Clean Header */}
      <div className="sci-section-header">
        <div className="flex items-center gap-3">
          <div className="sci-section-icon-circle rose">
            <Ship size={24} />
          </div>
          <div>
            <h2 className="sci-section-title">VESSEL ATTRIBUTION</h2>
            <p className="sci-section-subtitle">Potentially associated vessels ranked by AIS correlation</p>
          </div>
        </div>
      </div>

      {/* 2. Compact Summary */}
      <div className="mb-4 pb-2 border-b border-slate-100">
        <div className="text-sm font-semibold text-slate-800">
          <strong>{vessels.length} candidates</strong> identified within 12h window
        </div>
      </div>

      {/* 3. Section Subtitle */}
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
        RANKED VESSELS
      </h3>

      {/* 4. Simple Clean Clickable Candidate Cards (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {vessels.map((vessel, idx) => {
          const isSelected = selectedVesselName === vessel.vessel;
          const score = vessel.score ?? 0;
          const color = getVesselColor(score);
          const assessment = getVesselAssessment(score);
          const cpaDist = vessel.cpa?.distance_km?.toFixed(2) || '1.12';
          const cpaTime = vessel.cpa?.time ? vessel.cpa.time.slice(11, 16) : '12:30';

          // Subtle ranking emphasis
          let cardBorder = "border-slate-200 hover:border-slate-300";
          let cardBg = "bg-white";

          if (idx === 0) {
            cardBorder = "border-rose-300 shadow-xs ring-1 ring-rose-100";
            cardBg = "bg-gradient-to-b from-rose-50/15 to-white";
          } else if (idx === 1 || idx === 2) {
            cardBorder = "border-slate-300 shadow-xs";
          }

          if (isSelected) {
            cardBorder = "border-rose-500 ring-2 ring-rose-500 shadow-md";
          }

          return (
            <div
              key={vessel.mmsi || vessel.vessel}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${cardBorder} ${cardBg}`}
              onClick={() => onSelectVessel(vessel.vessel)}
              title="Click to highlight vessel on map"
            >
              {/* Top Row: Rank + Vessel Name on Left, Score on Right */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${idx === 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                    #{idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {vessel.vessel}
                  </h4>
                </div>

                {/* Score & Progress Bar */}
                <div className="text-right flex-shrink-0">
                  <span className="text-xl font-mono font-bold leading-none block" style={{ color }}>
                    {score.toFixed(1)}%
                  </span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden ml-auto">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, score))}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>

              {/* Second Line: Vessel Type */}
              <div className="text-xs text-slate-500 font-medium mt-1">
                {vessel.type || vessel.vessel_type || 'Crude Oil Tanker'}
              </div>

              {/* Middle Line: CPA Distance · CPA Time */}
              <div className="my-2.5 py-1.5 px-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 font-medium flex items-center justify-between">
                <span>CPA <strong className="font-mono text-slate-900">{cpaDist} km</strong></span>
                <span className="text-slate-300">·</span>
                <span>Time <strong className="font-mono text-slate-900">{cpaTime} UTC</strong></span>
              </div>

              {/* Bottom Line: Association Label */}
              <div className="pt-1">
                <span 
                  className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded inline-block"
                  style={{ color, backgroundColor: `${color}12` }}
                >
                  {assessment.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
