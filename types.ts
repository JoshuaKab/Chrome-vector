
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export type ConversionMode = 'RGB_TO_CMYK' | 'CMYK_TO_RGB';

export interface VectorResult {
  svgContent: string;
  previewUrl: string;
  originalImage: string;
}
