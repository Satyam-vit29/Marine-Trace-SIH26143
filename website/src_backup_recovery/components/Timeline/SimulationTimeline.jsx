import { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

export function SimulationTimeline({
  mode = 'forward',
  timeIndex = 0,
  maxSteps = 144,
  isPlaying = false,
  playbackSpeed = 1,
  originCoords = { lat: 16.3820, lon: 82.6180 },
  onTimeChange,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onModeChange,
}) {
  const isForward = mode === 'forward';
  const isComplete = timeIndex >= maxSteps;

  // Calculate formatted simulated time string based on step index
  const getSimulatedTime = (index) => {
    const baseDate = isForward
      ? new Date(Date.UTC(2026, 7, 28, 12, 0, 0))
      : new Date(Date.UTC(2026, 7, 28, 18, 0, 0));

    const offsetMinutes = isForward ? index * 10 : -index * 10;
    const date = new Date(baseDate.getTime() + offsetMinutes * 60000);

    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getUTCFullYear();
    const mm = pad(date.getUTCMonth() + 1);
    const dd = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const min = pad(date.getUTCMinutes());

    const totalMinutes = Math.abs(offsetMinutes);
    const elapsedH = Math.floor(totalMinutes / 60);
    const elapsedM = totalMinutes % 60;
    const relSign = isForward ? '+' : '-';
    const relOffset = `${relSign}${pad(elapsedH)}h ${pad(elapsedM)}m`;

    return {
      isoTime: `${yyyy}-${mm}-${dd} ${hh}:${min}:00 UTC`,
      relOffset,
    };
  };

  const currentSimTime = getSimulatedTime(timeIndex);

  // Playback timer effect
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const intervalMs = Math.max(30, 200 / playbackSpeed);
      timer = setInterval(() => {
        onTimeChange((prev) => {
          if (prev >= maxSteps) {
            onTogglePlay(false);
            return maxSteps;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, maxSteps, onTimeChange, onTogglePlay]);

  // Handler to trigger "RUN FORECAST"
  const handleRunForecast = () => {
    if (!isForward) {
      onModeChange('forward');
      onTimeChange(0);
      onTogglePlay(true);
    } else {
      if (isComplete) onTimeChange(0);
      onTogglePlay(!isPlaying);
    }
  };

  // Handler to trigger "RUN BACKTRACK"
  const handleRunBacktrack = () => {
    if (isForward) {
      onModeChange('backward');
      onTimeChange(0);
      onTogglePlay(true);
    } else {
      if (isComplete) onTimeChange(0);
      onTogglePlay(!isPlaying);
    }
  };

  return (
    <div className="sci-timeline-hud">
      {/* Top Meta Bar */}
      <div className="sci-timeline-meta-bar">
        <div className="sci-timeline-mode-toggle">
          <button
            className={`sci-mode-tab ${isForward ? 'active' : ''}`}
            onClick={() => {
              if (!isForward) {
                onModeChange('forward');
                onTimeChange(0);
                onTogglePlay(false);
              }
            }}
            title="OpenOil Forward Lagrangian Drift Forecast (+24H)"
          >
            <span className="mode-dot dot-blue" />
            <span>FORWARD PREDICTION (+24H)</span>
          </button>
          <button
            className={`sci-mode-tab ${!isForward ? 'active' : ''}`}
            onClick={() => {
              if (isForward) {
                onModeChange('backward');
                onTimeChange(0);
                onTogglePlay(false);
              }
            }}
            title="OpenDrift Backward Hindcast to Origin (-12H)"
          >
            <span className="mode-dot dot-orange" />
            <span>BACKWARD HINDCAST (-12H)</span>
          </button>
        </div>

        <div className="sci-clock-badge">
          <Clock size={14} className={isForward ? 'text-blue-600' : 'text-orange-600'} />
          <span className="font-mono font-bold text-slate-800 text-xs">{currentSimTime.isoTime}</span>
          <span className="sci-offset-tag font-mono">{currentSimTime.relOffset}</span>
        </div>

        <div className="sci-step-counter font-mono text-xs text-slate-600">
          <span>STEP <strong>{String(timeIndex).padStart(3, '0')}</strong></span>
          <span className="text-slate-400"> / {String(maxSteps).padStart(3, '0')}</span>
        </div>
      </div>

      {/* Scrubber & Slider Track */}
      <div className="sci-timeline-scrubber-row">
        <span className="font-mono text-xs text-slate-500 font-semibold whitespace-nowrap">
          {isForward ? '12:00 UTC (T+0)' : '18:00 UTC (T-0: Spill)'}
        </span>

        <div className="sci-scrubber-container">
          <input
            type="range"
            min={0}
            max={maxSteps}
            value={timeIndex}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="sci-timeline-range-input"
            aria-label="Simulation timeline scrubber"
          />
          <div 
            className={`sci-scrubber-fill ${isForward ? 'fill-blue' : 'fill-orange'}`} 
            style={{ width: `${(timeIndex / maxSteps) * 100}%` }}
          />
        </div>

        <span className="font-mono text-xs text-slate-500 font-semibold whitespace-nowrap">
          {isForward ? '12:00 UTC (+24h)' : '06:00 UTC (-12h: Origin)'}
        </span>
      </div>

      {/* Control Buttons & Playback Speed Bar */}
      <div className="sci-timeline-controls-row">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* RUN FORECAST ACTION */}
          <button
            className={`sci-play-btn btn-blue`}
            onClick={handleRunForecast}
            title="Simulate forward Lagrangian drift forecast (+24H)"
          >
            {isForward && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            <span>{isForward && isPlaying ? 'PAUSE FORECAST' : 'RUN FORECAST'}</span>
          </button>

          {/* RUN BACKTRACK ACTION */}
          <button
            className={`sci-play-btn btn-orange`}
            onClick={handleRunBacktrack}
            title="Simulate backward hindcast to probable origin (-12H)"
          >
            {!isForward && isPlaying ? <Pause size={14} fill="currentColor" /> : <Compass size={14} />}
            <span>{!isForward && isPlaying ? 'PAUSE BACKTRACK' : 'RUN BACKTRACK'}</span>
          </button>

          {/* RESET BUTTON */}
          <button 
            className="sci-ctrl-btn" 
            onClick={onReset} 
            title="Reset to Step 0"
          >
            <RotateCcw size={14} />
          </button>

          {/* ORIGIN ESTIMATED COMPLETION PILL */}
          {!isForward && isComplete && originCoords && (
            <div className="sci-origin-estimated-pill">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span className="font-bold text-emerald-950 text-xs">✓ ORIGIN ESTIMATED:</span>
              <span className="font-mono font-extrabold text-slate-900 text-xs">
                {originCoords.lat?.toFixed(4)}° N, {originCoords.lon?.toFixed(4)}° E (±2.80 km)
              </span>
            </div>
          )}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs font-mono font-bold text-slate-500 mr-1">SPEED:</span>
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              className={`sci-speed-chip ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => onSpeedChange(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
