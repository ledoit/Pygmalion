import { Sketch, RenderedVariation, AIServiceResponse } from '../types';

// Mock implementations - replace with actual API calls
// In production, these would connect to your AI service endpoints

export const processImageWithSegmentAnything = async (imageUri: string): Promise<Sketch[]> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock result - in production, this would call Segment Anything API
  const mockSketches: Sketch[] = [
    {
      id: '1',
      imageUri: imageUri,
      boundingBox: { x: 50, y: 100, width: 200, height: 150 },
      ocrText: 'Coffee mug with handle',
      category: 'kitchenware'
    },
    {
      id: '2',
      imageUri: imageUri,
      boundingBox: { x: 300, y: 50, width: 180, height: 200 },
      ocrText: 'Ergonomic chair design',
      category: 'furniture'
    }
  ];
  
  return mockSketches;
};

export const extractTextWithOCR = async (imageUri: string): Promise<string> => {
  // Simulate OCR processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OCR result
  return 'Coffee mug with handle - modern design, ceramic material';
};

export const generateVariationsWithControlNet = async (
  sketch: Sketch,
  count: number = 3
): Promise<RenderedVariation[]> => {
  // Simulate image generation delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Mock variations - in production, this would call ControlNet + Stable Diffusion XL
  const styles = ['realistic', 'minimalist', 'industrial', 'organic', 'futuristic'];
  const variations: RenderedVariation[] = [];
  
  for (let i = 0; i < count; i++) {
    variations.push({
      id: `${sketch.id}-var-${i}`,
      sketchId: sketch.id,
      imageUri: sketch.imageUri, // In production, this would be the generated image URI
      style: styles[i % styles.length]
    });
  }
  
  return variations;
};

export const generateCardContentWithGPT = async (
  variation: RenderedVariation,
  sketch: Sketch
): Promise<{ title: string; tagline: string }> => {
  // Simulate GPT processing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock GPT result - in production, this would call GPT-4o mini API
  const mockTitles = [
    'Modern Coffee Companion',
    'Ergonomic Workspace Chair',
    'Minimalist Design Object',
    'Innovative Product Concept'
  ];
  
  const mockTaglines = [
    'Perfect blend of form and function',
    'Comfort meets contemporary design',
    'Simplicity redefined for modern living',
    'Tomorrow\'s design, today\'s inspiration'
  ];
  
  return {
    title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
    tagline: mockTaglines[Math.floor(Math.random() * mockTaglines.length)]
  };
};

// Batch processing for multiple sketches
export const processBatchSketches = async (sketches: Sketch[]): Promise<RenderedVariation[]> => {
  const allVariations: RenderedVariation[] = [];
  
  for (const sketch of sketches) {
    const variations = await generateVariationsWithControlNet(sketch, 3);
    allVariations.push(...variations);
  }
  
  return allVariations;
};