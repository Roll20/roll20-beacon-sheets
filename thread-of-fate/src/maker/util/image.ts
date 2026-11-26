/**
 * Downscale + re-encode an uploaded image to a compact JPEG data URL, so portraits
 * stay small enough for localStorage and the Beacon character blob. Animated GIFs
 * are passed through unchanged (canvas would flatten them).
 */
export async function downscaleImage(file: File, maxDim: number, quality = 0.82): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  if (file.type === 'image/gif') return dataUrl;

  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

/** Rough decoded byte size of a data URL (base64 is ~4/3 the byte count). */
export function dataUrlApproxKb(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.round((b64.length * 0.75) / 1024);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
