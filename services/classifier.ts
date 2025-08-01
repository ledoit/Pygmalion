import { AIServiceResponse } from '../types';

// Define the 9 categories for classification
export const CATEGORIES = [
  'apps',
  'tees', 
  'chairs',
  'cars',
  'decorations',
  'hot sauces',
  'boba',
  'coffee',
  'cocktails'
] as const;

export type Category = typeof CATEGORIES[number];

export interface ClassificationResult {
  category: Category;
  confidence: number; // 0.0 to 1.0
  reasoning?: string; // Optional explanation from GPT
}

/**
 * Classifies a sketch into one of the predefined categories using GPT-4o mini
 * 
 * This function combines image data and OCR text to make a classification decision.
 * The GPT model is prompted to return both a category and confidence score.
 * 
 * TODO: Replace with CLIP-based classification for faster, more cost-effective inference
 * TODO: Add model fine-tuning on user corrections to improve accuracy over time
 * TODO: Consider ensemble methods combining multiple classification approaches
 */
export const classifySketch = async (
  imageUri: string,
  ocrText?: string
): Promise<ClassificationResult> => {
  try {
    // For now, this is a mock implementation
    // In production, this would call GPT-4o mini with:
    // 1. The cropped sketch image
    // 2. The OCR text as context
    // 3. A prompt asking for category classification with confidence
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Mock classification based on OCR text keywords
    const text = (ocrText || '').toLowerCase();
    let category: Category = 'decorations'; // default
    let confidence = 0.7;
    
    if (text.includes('coffee') || text.includes('mug') || text.includes('cup')) {
      category = 'coffee';
      confidence = 0.9;
    } else if (text.includes('chair') || text.includes('seat') || text.includes('furniture')) {
      category = 'chairs';
      confidence = 0.85;
    } else if (text.includes('car') || text.includes('vehicle') || text.includes('automobile')) {
      category = 'cars';
      confidence = 0.8;
    } else if (text.includes('app') || text.includes('mobile') || text.includes('interface')) {
      category = 'apps';
      confidence = 0.75;
    } else if (text.includes('shirt') || text.includes('tee') || text.includes('clothing')) {
      category = 'tees';
      confidence = 0.8;
    } else if (text.includes('boba') || text.includes('bubble tea') || text.includes('tapioca')) {
      category = 'boba';
      confidence = 0.9;
    } else if (text.includes('sauce') || text.includes('hot') || text.includes('spicy')) {
      category = 'hot sauces';
      confidence = 0.8;
    } else if (text.includes('cocktail') || text.includes('drink') || text.includes('alcohol')) {
      category = 'cocktails';
      confidence = 0.75;
    }
    
    return {
      category,
      confidence,
      reasoning: `Classified based on OCR text: "${ocrText}"`
    };
    
  } catch (error) {
    console.error('Classification error:', error);
    
    // Return default classification on error
    return {
      category: 'decorations',
      confidence: 0.5,
      reasoning: 'Default classification due to error'
    };
  }
};

/**
 * Production GPT-4o mini implementation (currently commented out)
 * 
 * This would be the actual implementation using OpenAI's API:
 * 
 * const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     model: 'gpt-4o-mini',
 *     messages: [
 *       {
 *         role: 'system',
 *         content: `You are a product categorization expert. Classify sketches into exactly one of these categories: ${CATEGORIES.join(', ')}. Return a JSON object with "category", "confidence" (0.0-1.0), and "reasoning".`
 *       },
 *       {
 *         role: 'user', 
 *         content: [
 *           {
 *             type: 'text',
 *             text: `Please classify this sketch. OCR text: "${ocrText}"`
 *           },
 *           {
 *             type: 'image_url',
 *             image_url: { url: imageUri }
 *           }
 *         ]
 *       }
 *     ],
 *     response_format: { type: 'json_object' }
 *   })
 * });
 */

/**
 * Batch classify multiple sketches
 * Useful for processing multiple sketches from a single notebook page
 */
export const classifySketches = async (
  sketches: Array<{ imageUri: string; ocrText?: string }>
): Promise<ClassificationResult[]> => {
  // Process sketches in parallel for better performance
  const classifications = await Promise.all(
    sketches.map(sketch => classifySketch(sketch.imageUri, sketch.ocrText))
  );
  
  return classifications;
};

/**
 * Save user corrections for potential model retraining
 * This data could be used to fine-tune the classification model
 */
export const saveClassificationCorrection = async (
  sketchId: string,
  originalCategory: Category,
  correctedCategory: Category,
  imageUri: string,
  ocrText?: string
): Promise<void> => {
  try {
    // Import here to avoid circular dependencies
    const { saveClassificationCorrection: saveCorrection } = await import('./supabase');
    
    const success = await saveCorrection(
      sketchId,
      originalCategory,
      correctedCategory,
      imageUri,
      ocrText
    );
    
    if (success) {
      console.log('Classification correction saved successfully:', {
        sketchId,
        originalCategory,
        correctedCategory
      });
    } else {
      console.error('Failed to save classification correction');
    }
    
  } catch (error) {
    console.error('Error saving classification correction:', error);
  }
};