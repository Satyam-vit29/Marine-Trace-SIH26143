import { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';

// Draw the original scientific vector arrow icon
function drawGridArrow(ctx, x, y, angleDeg, isCurrent, opacity) {
  if (opacity <= 0.02) return;

  const rad = (angleDeg * Math.PI) / 180;
  const color = isCurrent ? '#0d9488' : '#2563eb';
  const strokeColor = isCurrent ? '#0f766e' : '#1d4ed8';

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rad);

  const lengthPx = isCurrent ? 22 : 26;
  const halfLen = lengthPx / 2;
  const headLen = isCurrent ? 6.5 : 7.0;
  const headWidth = isCurrent ? 8.2 : 8.6;

  // Vector line (shaft)
  ctx.beginPath();
  if (!isCurrent) {
    ctx.setLineDash([3, 2]); // Original dashed line for ERA5 wind
  } else {
    ctx.setLineDash([]);    // Original solid line for CMEMS current
  }
  ctx.moveTo(0, halfLen);
  ctx.lineTo(0, -halfLen + headLen * 0.7);
  ctx.strokeStyle = color;
  ctx.lineWidth = isCurrent ? 2.0 : 1.8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Arrow Head
  ctx.beginPath();
  ctx.setLineDash([]);
  ctx.moveTo(0, -halfLen - 1.5); // Arrow tip
  ctx.lineTo(-headWidth / 2, -halfLen + headLen);
  ctx.lineTo(headWidth / 2, -halfLen + headLen);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.restore();
}

export function VectorFieldLayer({ 
  forcingData,
  center = [16.50, 82.80],
  showCurrent = true, 
  showWind = true 
}) {
  const map = useMap();

  const atmo = forcingData?.atmospheric_forcing || {};
  const hydro = forcingData?.hydrodynamic_forcing || {};

  const windBearing = atmo.direction_deg || 42.5;
  const windSpeed = atmo.speed_mean_ms || 4.12;

  const currentBearing = hydro.direction_deg || 38.0;
  const currentSpeed = hydro.speed_mean_ms || 0.28;

  const centerLat = center?.[0] || 16.50;
  const centerLon = center?.[1] || 82.80;

  // Original regular 5x6 spatial grid covering the AOI
  const gridCells = useMemo(() => {
    const cells = [];
    const minLat = centerLat - 0.22;
    const maxLat = centerLat + 0.18;
    const minLon = centerLon - 0.28;
    const maxLon = centerLon + 0.26;
    const stepsLat = 4; // 5 rows
    const stepsLon = 5; // 6 columns

    for (let i = 0; i <= stepsLat; i++) {
      const lat = minLat + (i / stepsLat) * (maxLat - minLat);
      for (let j = 0; j <= stepsLon; j++) {
        const lon = minLon + (j / stepsLon) * (maxLon - minLon);
        const latOffset = (lat - centerLat);
        const lonOffset = (lon - centerLon);
        
        const localCurrentBearing = currentBearing + (lonOffset * 4.0) - (latOffset * 2.0);
        const localCurrentSpeed = currentSpeed + (latOffset * 0.02);

        const localWindBearing = windBearing + (lonOffset * 2.0);
        const localWindSpeed = windSpeed + (latOffset * 0.1);

        // Staggered phase offset for each grid cell so arrows flow smoothly without unison jumps
        const phase = ((i * 0.38 + j * 0.24) % 1.0);

        cells.push({
          lat,
          lon,
          phase,
          currentAngle: localCurrentBearing,
          currentSpd: localCurrentSpeed,
          windAngle: localWindBearing,
          windSpd: localWindSpeed,
        });
      }
    }
    return cells;
  }, [centerLat, centerLon, currentBearing, currentSpeed, windBearing, windSpeed]);

  // Continuous Canvas animation loop
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'vector-field-flow-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();
    let windProgress = 0;
    let currentProgress = 0;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Continuous flowing progression
      windProgress = (windProgress + dt * 0.40) % 1.0;
      currentProgress = (currentProgress + dt * 0.26) % 1.0;

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 1. CMEMS Current Arrows (Exactly 30 fixed grid points, continuous flow)
      if (showCurrent) {
        const travelDist = 16; // Smooth continuous movement distance along vector
        gridCells.forEach((cell) => {
          const basePt = map.latLngToContainerPoint([cell.lat + 0.012, cell.lon - 0.01]);
          if (basePt.x < -40 || basePt.x > width + 40 || basePt.y < -40 || basePt.y > height + 40) return;

          const rad = (cell.currentAngle * Math.PI) / 180;
          const ux = Math.sin(rad);
          const uy = -Math.cos(rad);

          // Continuous motion with staggered cell phase
          const progress = (currentProgress + cell.phase) % 1.0;
          const disp = (progress - 0.5) * travelDist;
          const x = basePt.x + disp * ux;
          const y = basePt.y + disp * uy;

          // Smooth opacity envelope to prevent blinking or snapping
          const opacity = Math.sin(progress * Math.PI) ** 0.4 * 0.95;
          drawGridArrow(ctx, x, y, cell.currentAngle, true, opacity);
        });
      }

      // 2. ERA5 Wind Arrows (Exactly 30 fixed grid points, continuous flow)
      if (showWind) {
        const travelDist = 18; // Smooth continuous movement distance along vector
        gridCells.forEach((cell) => {
          const basePt = map.latLngToContainerPoint([cell.lat - 0.015, cell.lon + 0.018]);
          if (basePt.x < -40 || basePt.x > width + 40 || basePt.y < -40 || basePt.y > height + 40) return;

          const rad = (cell.windAngle * Math.PI) / 180;
          const ux = Math.sin(rad);
          const uy = -Math.cos(rad);

          // Continuous motion with staggered cell phase
          const progress = (windProgress + cell.phase) % 1.0;
          const disp = (progress - 0.5) * travelDist;
          const x = basePt.x + disp * ux;
          const y = basePt.y + disp * uy;

          // Smooth opacity envelope to prevent blinking or snapping
          const opacity = Math.sin(progress * Math.PI) ** 0.4 * 0.95;
          drawGridArrow(ctx, x, y, cell.windAngle, false, opacity);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, gridCells, showCurrent, showWind]);

  return null;
}
