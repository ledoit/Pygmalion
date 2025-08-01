# Pygmalion

A React Native + Expo app that transforms notebook page photos into swipe-ready product concept cards for TasteMatch.

## Overview

Pygmalion streamlines the product concept development process by automatically converting hand-drawn sketches into polished, AI-generated product cards. Perfect for designers, product managers, and entrepreneurs who want to quickly iterate on ideas.

## Features

### 📸 Smart Capture
- Take photos of notebook pages with multiple sketches
- Auto-processes images using AI segmentation
- Extracts handwritten text and annotations via OCR

### 🎨 AI-Powered Generation
- **Segment Anything (Meta)**: Detects and crops individual sketches
- **ControlNet + Stable Diffusion XL**: Generates 3-5 rendered variations per sketch
- **GPT-4o mini**: Creates compelling titles and taglines

### 📱 Streamlined Workflow
1. **Capture Screen**: Photo capture with real-time processing feedback
2. **Gallery Screen**: Browse and select from AI-generated variations
3. **Card Output Screen**: Edit content and export to TasteMatch format
4. **History Screen**: View and manage past generated cards

### 🔄 Batch Processing
- Process multiple sketches from a single photo
- Generate variations for all detected concepts simultaneously
- Select and customize the best variations

## Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation
- **Database**: Supabase
- **AI Services**: 
  - Segment Anything (Meta) for object detection
  - OCR for text extraction
  - ControlNet + Stable Diffusion XL for image generation
  - GPT-4o mini for content generation
- **UI**: Expo Vector Icons, Linear Gradients

## Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Setup

1. **Clone and install dependencies**:
   ```bash
   cd Pygmalion
   npm install
   ```

2. **Configure Supabase**:
   - Create a new Supabase project
   - Update `services/supabase.ts` with your project URL and anon key
   - Create the `product_cards` table:
   ```sql
   CREATE TABLE product_cards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     sketch_id TEXT NOT NULL,
     rendered_variation_id TEXT NOT NULL,
     image_uri TEXT NOT NULL,
     title TEXT NOT NULL,
     tagline TEXT NOT NULL,
     category TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Configure AI Services**:
   - Update `services/aiService.ts` with your AI service endpoints
   - Replace mock implementations with actual API calls
   - Set up authentication for each service

4. **Run the app**:
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

## Project Structure

```
Pygmalion/
├── screens/              # Main app screens
│   ├── HomeScreen.tsx    # Landing page with navigation
│   ├── CaptureScreen.tsx # Camera interface
│   ├── GalleryScreen.tsx # Variation selection
│   ├── CardOutputScreen.tsx # Final card editing
│   └── HistoryScreen.tsx # Saved cards browser
├── services/             # External service integrations
│   ├── aiService.ts      # AI processing functions
│   └── supabase.ts       # Database operations
├── types/                # TypeScript type definitions
│   └── index.ts
├── app.json             # Expo configuration
└── App.tsx              # Main app entry point
```

## Configuration

### Camera Permissions
The app requires camera permissions configured in `app.json`:
- iOS: `NSCameraUsageDescription`
- Android: `android.permission.CAMERA`

### AI Service Integration
Currently uses mock implementations. To integrate real AI services:

1. **Segment Anything**: Update `processImageWithSegmentAnything()` in `aiService.ts`
2. **OCR**: Update `extractTextWithOCR()` for text extraction
3. **Image Generation**: Update `generateVariationsWithControlNet()` for ControlNet/SDXL
4. **Content Generation**: Update `generateCardContentWithGPT()` for GPT-4o mini

## Usage

1. **Start**: Launch the app and tap "Capture Notebook"
2. **Capture**: Take a photo of your notebook page with sketches
3. **Process**: Wait for AI to detect sketches and extract text
4. **Select**: Choose your favorite variations from the generated options
5. **Customize**: Edit titles and taglines as needed
6. **Save**: Export cards to TasteMatch database

## MVP Scope

This is an MVP version focused on core functionality:
- ✅ No user authentication required
- ✅ No monetization features
- ✅ No gamification elements
- ✅ Batch processing support
- ✅ Clean, production-ready UI

## Future Enhancements

- Real-time collaboration on sketches
- Advanced style transfer options
- Integration with design tools (Figma, Sketch)
- Export to multiple formats
- User accounts and cloud sync
- Analytics and usage insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation
- Review the code comments for implementation details