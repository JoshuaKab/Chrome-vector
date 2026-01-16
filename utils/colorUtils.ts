
import { RGB, CMYK } from '../types';

export const rgbToCmyk = (r: number, g: number, b: number): CMYK => {
  let r_prime = r / 255;
  let g_prime = g / 255;
  let b_prime = b / 255;

  let k = 1 - Math.max(r_prime, g_prime, b_prime);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  let c = Math.round(((1 - r_prime - k) / (1 - k)) * 100);
  let m = Math.round(((1 - g_prime - k) / (1 - k)) * 100);
  let y = Math.round(((1 - b_prime - k) / (1 - k)) * 100);
  
  return { 
    c: Math.max(0, c), 
    m: Math.max(0, m), 
    y: Math.max(0, y), 
    k: Math.round(k * 100) 
  };
};

export const cmykToRgb = (c: number, m: number, y: number, k: number): RGB => {
  let c_prime = c / 100;
  let m_prime = m / 100;
  let y_prime = y / 100;
  let k_prime = k / 100;

  let r = Math.round(255 * (1 - c_prime) * (1 - k_prime));
  let g = Math.round(255 * (1 - m_prime) * (1 - k_prime));
  let b = Math.round(255 * (1 - y_prime) * (1 - k_prime));

  return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
