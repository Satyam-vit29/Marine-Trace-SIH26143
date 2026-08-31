import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check 
} from 'lucide-react';
import { SCIENTIFIC_WORKFLOW_STAGES } from '../../utils/envConstants';

export function PresentationTour({
  currentStageId,
  onSelectStage,
  onClose,
  onPlaySimulation,
  onSelectVessel,
}) {
  const currentStageIndex = SCIENTIFIC_WORKFLOW_STAGES.findIndex((s) => s.id === currentStageId);
  const stage = SCIENTIFIC_WORKFLOW_STAGES[currentStageIndex] || SCIENTIFIC_WORKFLOW_STAGES[0];

  const handleNext = () => {
    if (currentStageIndex < SCIENTIFIC_WORKFLOW_STAGES.length - 1) {
      const nextStage = SCIENTIFIC_WORKFLOW_STAGES[currentStageIndex + 1];
      onSelectStage(nextStage.id);
      if (nextStage.id === 'FORECAST') {
        onPlaySimulation(true);
      } else if (nextStage.id === 'ATTRIBUTE') {
        onSelectVessel('Vessel Alpha');
      }
    }
  };

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      const prevStage = SCIENTIFIC_WORKFLOW_STAGES[currentStageIndex - 1];
      onSelectStage(prevStage.id);
    }
  };

  // Specific scientific narrative per stage
  const getStageNarrative = (id) => {
    switch (id) {
      case 'SATELLITE':
        return 'Satellite Sentinel-1 C-SAR radar passes over the Arabian Sea at 18:00 UTC, detecting a surface backscatter damping anomaly (-4.8 dB) characteristic of an oil slick.';
      case 'CHARACTERIZE':
        return 'Automated image segmentation extracts slick morphometrics: 10.38 km² surface area, 13.91 km perimeter, and major axis orientation of 90.8°. Inversion models estimate slick age at ~6.0 hours.';
      case 'ENVIRONMENT':
        return 'Real meteorological ERA5 10m winds (3.29 m/s @ 71.8°) and Copernicus Marine surface currents (0.21 m/s @ 76.1°) are extracted to formulate the hydrodynamic drift coupling field.';
      case 'FORECAST':
        return 'OpenOil 24-hour forward Lagrangian simulation models the future trajectory and dispersion of 300 oil particles under the coupled wind and current forcing.';
      case 'HINDCAST':
        return 'To identify the discharge source, OpenDrift reverses the hydrodynamic equations 12 hours backward, converging to a Probable Origin at 18.4686° N, 69.8812° E (±2.8 km uncertainty).';
      case 'CORRELATE':
        return 'A multi-stage spatio-temporal filter queries historical AIS traffic within the 12-hour window: 127 regional vessels are filtered to 23 spatial candidates and 8 temporal intersecting tracks.';
      case 'ATTRIBUTE':
        return 'Attribution algorithms score candidate vessels by Closest Point of Approach (CPA) and corridor alignment. Vessel Alpha is identified with the highest association (95.3%, 1.18 km CPA at 14:00 UTC).';
      default:
        return stage.description;
    }
  };

  return (
    <div className="sci-presentation-tour-hud">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-100 text-blue-700">
            <Sparkles size={14} />
          </div>
          <span className="font-bold text-xs text-blue-900 uppercase">SIH 2026 EVALUATION TOUR</span>
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
            STAGE {stage.number}/07: {stage.title.toUpperCase()}
          </span>
        </div>
        <button className="text-slate-400 hover:text-slate-700 p-1" onClick={onClose} title="Exit Tour">
          <X size={15} />
        </button>
      </div>

      <div className="py-2">
        <h4 className="font-bold text-xs text-slate-800 mb-1">{stage.subtitle}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{getStageNarrative(stage.id)}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <div className="flex items-center gap-1.5">
          {SCIENTIFIC_WORKFLOW_STAGES.map((s, idx) => (
            <button
              key={s.id}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentStageIndex ? 'bg-blue-600 scale-125' : idx < currentStageIndex ? 'bg-blue-300' : 'bg-slate-300'}`}
              onClick={() => onSelectStage(s.id)}
              title={`Jump to ${s.title}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="sci-btn btn-sm btn-outline"
            onClick={handlePrev}
            disabled={currentStageIndex === 0}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          {currentStageIndex < SCIENTIFIC_WORKFLOW_STAGES.length - 1 ? (
            <button className="sci-btn btn-sm btn-primary" onClick={handleNext}>
              <span>Next Stage</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button className="sci-btn btn-sm btn-success" onClick={onClose}>
              <Check size={14} />
              <span>Complete Tour</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
