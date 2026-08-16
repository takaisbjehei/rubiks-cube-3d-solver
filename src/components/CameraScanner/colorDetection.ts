import { CubeColor } from '../../types/cube';

export interface ColorSample {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s, v };
}

/**
 * Classify a sampled RGB patch into one of the 6 standard Rubik's Cube colors
 */
export function classifyColor(sample: ColorSample): CubeColor {
  const { r, g, b } = sample;
  const { h, s, v } = rgbToHsv(r, g, b);

  // 1. White: low saturation, relatively high brightness
  // (In warm ambient light, white can have slight tint but saturation is significantly lower than colors)
  if (s < 0.22 && v > 0.35) {
    return 'white';
  }

  // 2. Yellow: Hue ~ 42° to 70° with good brightness
  if (h >= 42 && h <= 72) {
    if (s > 0.25) return 'yellow';
  }

  // 3. Orange: Hue ~ 14° to 42°
  if (h >= 14 && h < 42) {
    if (s > 0.3) return 'orange';
  }

  // 4. Red: Hue 0°..14° or 340°..360°
  if (h < 14 || h >= 340) {
    if (s > 0.3) return 'red';
  }

  // 5. Green: Hue ~ 73° to 170°
  if (h > 72 && h <= 170) {
    if (s > 0.2) return 'green';
  }

  // 6. Blue: Hue ~ 171° to 275°
  if (h > 170 && h <= 275) {
    if (s > 0.2) return 'blue';
  }

  // Fallback distance in RGB space to standard speedcube centroids
  const CENTROIDS: Record<CubeColor, ColorSample> = {
    white: { r: 245, g: 245, b: 245 },
    yellow: { r: 250, g: 210, b: 30 },
    red: { r: 210, g: 40, b: 40 },
    orange: { r: 240, g: 110, b: 25 },
    blue: { r: 35, g: 95, b: 230 },
    green: { r: 30, g: 180, b: 80 },
  };

  let minDistance = Infinity;
  let bestMatch: CubeColor = 'white';

  (Object.keys(CENTROIDS) as CubeColor[]).forEach(c => {
    const target = CENTROIDS[c];
    const dr = r - target.r;
    const dg = g - target.g;
    const db = b - target.b;
    const dist = dr * dr + dg * dg + db * db;
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = c;
    }
  });

  return bestMatch;
}

/**
 * Sample average RGB in a square patch from a Canvas 2D context
 */
export function samplePatch(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  patchRadius: number = 8
): ColorSample {
  const x = Math.max(0, Math.round(centerX - patchRadius));
  const y = Math.max(0, Math.round(centerY - patchRadius));
  const width = patchRadius * 2;
  const height = patchRadius * 2;

  try {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      totalR += data[i];
      totalG += data[i + 1];
      totalB += data[i + 2];
      count++;
    }

    if (count === 0) return { r: 255, g: 255, b: 255 };

    return {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count),
    };
  } catch {
    return { r: 255, g: 255, b: 255 };
  }
}
