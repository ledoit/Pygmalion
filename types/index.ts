import { ClassificationResult } from '../services/classifier';

export interface Sketch {
  id: string;
  imageUri: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ocrText?: string;
  category?: string;
  classification?: ClassificationResult;
}

export interface RenderedVariation {
  id: string;
  sketchId: string;
  imageUri: string;
  style: string;
  isSelected?: boolean;
}

export interface ProductCard {
  id: string;
  sketchId: string;
  renderedVariationId: string;
  imageUri: string;
  title: string;
  tagline: string;
  category: string;
  createdAt: Date;
}

export interface ProcessingResult {
  sketches: Sketch[];
  variations: RenderedVariation[];
}

export interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}