export interface ExtractedHeroColors {
  heroColor: string;
  heroColorSecondary: string;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastAgainstWhite(r: number, g: number, b: number): number {
  const L = relativeLuminance(r, g, b);
  
  return (1 + 0.05) / (L + 0.05);
}

export function extractColorsFromImage(img: HTMLImageElement): ExtractedHeroColors | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = 50;
  canvas.height = 50;
  ctx.drawImage(img, 0, 0, 50, 50);

  let imageData: Uint8ClampedArray;
  try {
    imageData = ctx.getImageData(0, 0, 50, 50).data;
  } catch (e) {
    console.warn('[ColorExtractor] Tainted canvas or CORS error reading image data:', e);
    return null;
  }

  const pixels: Array<{ h: number; s: number; l: number }> = [];

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a < 128) continue;

    const hsl = rgbToHsl(r, g, b);
    
    if (hsl.s >= 20 && hsl.l >= 15 && hsl.l <= 85) {
      pixels.push(hsl);
    }
  }

  if (pixels.length === 0) {
    return null;
  }

  
  const numBuckets = 18;
  const buckets = Array.from({ length: numBuckets }, (_, index) => ({
    hueSum: 0,
    weightSum: 0,
    count: 0,
    weight: 0,
    index,
  }));

  pixels.forEach((p) => {
    const bucketIndex = Math.min(numBuckets - 1, Math.floor(p.h / (360 / numBuckets)));
    const b = buckets[bucketIndex];
    const w = p.s * p.s;
    b.hueSum += p.h * w;
    b.weightSum += w;
    b.count++;
    b.weight += w; 
  });

  
  const sortedBuckets = buckets.filter((b) => b.count > 0).sort((a, b) => b.weight - a.weight);

  if (sortedBuckets.length === 0) {
    return null;
  }

  const primaryBucket = sortedBuckets[0];
  const h1 = Math.round(primaryBucket.hueSum / primaryBucket.weightSum);

  
  const secondaryBucket = sortedBuckets.find((b) => {
    const hVal = Math.round(b.hueSum / b.weightSum);
    const diff = Math.abs(h1 - hVal);
    const hueDiff = Math.min(diff, 360 - diff);
    return hueDiff >= 60;
  });

  let h2: number;
  if (secondaryBucket) {
    h2 = Math.round(secondaryBucket.hueSum / secondaryBucket.weightSum);
  } else {
    
    h2 = (h1 + 180) % 360;
  }

  
  const rgb1 = hslToRgb(h1, 95, 46);
  const rgb2 = hslToRgb(h2, 95, 46);

  
  
  const contrast1 = contrastAgainstWhite(rgb1.r, rgb1.g, rgb1.b);
  const contrast2 = contrastAgainstWhite(rgb2.r, rgb2.g, rgb2.b);

  const [heroRgb, heroSecondaryRgb] = contrast1 >= contrast2
    ? [rgb2, rgb1]   
    : [rgb1, rgb2];  

  return {
    heroColor: `${heroRgb.r} ${heroRgb.g} ${heroRgb.b}`,
    heroColorSecondary: `${heroSecondaryRgb.r} ${heroSecondaryRgb.g} ${heroSecondaryRgb.b}`,
  };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l, g = l, b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1 / 3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
