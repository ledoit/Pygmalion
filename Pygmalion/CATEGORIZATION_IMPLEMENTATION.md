# Auto-Categorization Module Implementation

## Overview

This document describes the implementation of the auto-categorization module for Pygmalion, which automatically classifies sketches into predefined categories using GPT-4o mini and allows user overrides.

## Features Implemented

### 1. Classification Service (`services/classifier.ts`)

- **Categories**: 9 predefined categories - apps, tees, chairs, cars, decorations, hot sauces, boba, coffee, cocktails
- **GPT-4o Mini Integration**: Mock implementation ready for production API calls
- **Confidence Scoring**: Returns confidence scores (0.0-1.0) with each classification
- **Batch Processing**: Support for classifying multiple sketches simultaneously
- **Error Handling**: Graceful fallback to default category on errors

### 2. Updated Processing Pipeline

- **Integration Point**: Classification occurs after OCR text extraction in `processImageWithSegmentAnything`
- **Data Flow**: Image → Segment Anything → OCR → Classification → Storage
- **Performance**: Parallel processing of sketches for better performance

### 3. User Interface Updates (`screens/CardOutputScreen.tsx`)

- **Category Display**: Shows predicted category with confidence percentage
- **Color-coded Confidence**: Green (>80%), Yellow (60-80%), Red (<60%)
- **Override Dropdown**: Modal-based category selection for user corrections
- **Visual Feedback**: Clear indication of AI predictions vs user selections

### 4. Data Management

- **Type Updates**: Added `ClassificationResult` interface to `Sketch` type
- **State Management**: Category selection state with Map-based storage
- **Persistence**: Final categories (auto or corrected) saved to Supabase

### 5. Correction Tracking

- **User Corrections**: Tracked when users override AI predictions
- **Database Storage**: Corrections saved to `classification_corrections` table
- **Future Use**: Data available for model retraining and accuracy analysis

## Code Structure

```
Pygmalion/
├── services/
│   ├── classifier.ts       # Core classification logic
│   ├── aiService.ts        # Updated to integrate classification
│   └── supabase.ts         # Updated with correction tracking
├── types/
│   └── index.ts           # Updated with ClassificationResult type
└── screens/
    └── CardOutputScreen.tsx # Updated with category UI
```

## Key Functions

### `classifySketch(imageUri, ocrText)`
- Main classification function
- Returns category, confidence, and reasoning
- Currently uses OCR text analysis (ready for GPT-4o mini)

### `selectCategory(category)`
- Handles user category overrides
- Tracks corrections for model improvement
- Updates UI state and saves to database

### `saveClassificationCorrection()`
- Stores user corrections in Supabase
- Enables future model fine-tuning
- Tracks accuracy metrics

## Production Deployment Notes

### 1. GPT-4o Mini Integration
```typescript
// Replace mock implementation in classifier.ts with:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [/* See classifier.ts for full prompt */],
    response_format: { type: 'json_object' }
  })
});
```

### 2. Database Schema
```sql
-- Classification corrections table
CREATE TABLE classification_corrections (
  id SERIAL PRIMARY KEY,
  sketch_id VARCHAR NOT NULL,
  original_category VARCHAR NOT NULL,
  corrected_category VARCHAR NOT NULL,
  image_uri TEXT NOT NULL,
  ocr_text TEXT,
  corrected_at TIMESTAMP DEFAULT NOW()
);

-- Update product_cards table if not already present
ALTER TABLE product_cards ADD COLUMN IF NOT EXISTS category VARCHAR;
```

### 3. Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Future Improvements

### 1. CLIP-based Classification
- Replace GPT-4o mini with CLIP for faster, cheaper inference
- Pre-trained visual embeddings for immediate classification
- Cost reduction from ~$0.01/image to ~$0.001/image

### 2. Model Fine-tuning
- Use correction data to fine-tune classification model
- Implement active learning pipeline
- Regular model updates based on user feedback

### 3. Advanced Features
- Confidence-based auto-approval (high confidence classifications)
- Multi-label classification for complex sketches
- Category suggestions based on user history

## Testing

### Manual Testing Flow
1. Capture notebook page with sketches
2. Verify classifications appear with confidence scores
3. Test category override functionality
4. Confirm corrected categories are saved
5. Validate data appears correctly in Supabase

### Key Test Cases
- Sketches with clear OCR text matching categories
- Ambiguous sketches (low confidence)
- User corrections and override functionality
- Error handling with missing/invalid data

## Performance Considerations

- Classification adds ~1.5s per sketch (mock delay)
- Parallel processing for multiple sketches
- Graceful degradation on API failures
- Efficient state management with Maps

## Accessibility

- Clear visual indicators for AI vs user selections
- Color-coded confidence with text labels
- Touch-friendly category selection modal
- Screen reader compatible labels