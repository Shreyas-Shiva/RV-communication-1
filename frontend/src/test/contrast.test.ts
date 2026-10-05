import { describe, it, expect } from 'vitest';
import { WORD_TYPE_PALETTE, WordClass } from '../data/palette';

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('AAC Word-Type Palette WCAG Contrast Conformance', () => {
  const wordClasses = Object.keys(WORD_TYPE_PALETTE) as WordClass[];

  it('defines valid hex colors for every word class', () => {
    wordClasses.forEach(wc => {
      const { fill, border, text } = WORD_TYPE_PALETTE[wc];
      expect(fill).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(border).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(text).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('meets WCAG AA contrast (> 4.5:1) for all text on background fill', () => {
    wordClasses.forEach(wc => {
      const { fill, text, label } = WORD_TYPE_PALETTE[wc];
      const ratio = getContrastRatio(fill, text);
      // All card labels must be easily readable by non-speaking users and users with low vision
      expect(ratio, `Contrast for ${label} (${wc}) text on fill should exceed 4.5:1`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('meets WCAG AAA contrast (> 7.0:1) for core high-contrast cards', () => {
    // Check that core card types achieve high contrast
    ['pronoun', 'noun', 'social', 'question', 'place_time', 'function'].forEach(wc => {
      const { fill, text, label } = WORD_TYPE_PALETTE[wc as WordClass];
      const ratio = getContrastRatio(fill, text);
      expect(ratio, `Contrast for ${label} (${wc}) text on fill should exceed 7:1`).toBeGreaterThanOrEqual(7.0);
    });
  });

  it('border color provides strong card definition (> 2.0:1 against fill)', () => {
    wordClasses.forEach(wc => {
      const { fill, border, label } = WORD_TYPE_PALETTE[wc];
      const ratio = getContrastRatio(fill, border);
      expect(ratio, `Border contrast for ${label} (${wc}) should exceed 2:1`).toBeGreaterThanOrEqual(2.0);
    });
  });
});
