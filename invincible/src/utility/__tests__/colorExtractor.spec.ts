import { describe, it, expect, vi } from 'vitest';
import { extractColorsFromImage, rgbToHsl } from '../colorExtractor';

describe('colorExtractor utility functions', () => {
  describe('rgbToHsl', () => {
    it('converts red correctly', () => {
      const hsl = rgbToHsl(255, 0, 0);
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('converts green correctly', () => {
      const hsl = rgbToHsl(0, 255, 0);
      expect(hsl.h).toBe(120);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('converts blue correctly', () => {
      const hsl = rgbToHsl(0, 0, 255);
      expect(hsl.h).toBe(240);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('converts white correctly', () => {
      const hsl = rgbToHsl(255, 255, 255);
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(100);
    });
  });

  describe('extractColorsFromImage', () => {
    it('returns null if canvas context is not mockable or fails', () => {
      
      const img = {} as HTMLImageElement;
      
      
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            getContext: () => null
          };
        }
        return originalCreateElement(tag);
      });

      const colors = extractColorsFromImage(img);
      expect(colors).toBeNull();

      document.createElement = originalCreateElement;
    });

    it('extracts dominant color and normalizes it to space-separated RGB format', () => {
      const img = {} as HTMLImageElement;
      
      
      const mockGetImageData = vi.fn().mockReturnValue({
        
        
        data: new Uint8ClampedArray(
          Array.from({ length: 50 * 50 }, (_, i) => {
            if (i < 1500) {
              return [255, 0, 0, 255]; 
            } else {
              return [0, 0, 255, 255]; 
            }
          }).flat()
        )
      });

      const originalCreateElement = document.createElement;
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              drawImage: () => {},
              getImageData: mockGetImageData
            })
          };
        }
        return originalCreateElement(tag);
      });

      const colors = extractColorsFromImage(img);
      expect(colors).not.toBeNull();
      
      expect(colors!.heroColor).toBe('229 6 6');
      expect(colors!.heroColorSecondary).toBe('6 6 229');

      document.createElement = originalCreateElement;
    });
  });
});
