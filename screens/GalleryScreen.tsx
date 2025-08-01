import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Sketch, RenderedVariation } from '../types';
import { generateVariationsWithControlNet } from '../services/aiService';

interface GalleryScreenProps {
  navigation: any;
  route: {
    params: {
      originalImage: string;
      sketches: Sketch[];
    };
  };
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function GalleryScreen({ navigation, route }: GalleryScreenProps) {
  const { originalImage, sketches } = route.params;
  const [variations, setVariations] = useState<RenderedVariation[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyGenerating, setCurrentlyGenerating] = useState<string | null>(null);

  useEffect(() => {
    generateAllVariations();
  }, []);

  const generateAllVariations = async () => {
    setIsLoading(true);
    const allVariations: RenderedVariation[] = [];

    for (const sketch of sketches) {
      setCurrentlyGenerating(sketch.id);
      try {
        const sketchVariations = await generateVariationsWithControlNet(sketch, 3);
        allVariations.push(...sketchVariations);
      } catch (error) {
        console.error('Error generating variations for sketch:', sketch.id, error);
      }
    }

    setCurrentlyGenerating(null);
    setVariations(allVariations);
    setIsLoading(false);
  };

  const toggleVariationSelection = (variationId: string) => {
    const newSelection = new Set(selectedVariations);
    if (newSelection.has(variationId)) {
      newSelection.delete(variationId);
    } else {
      newSelection.add(variationId);
    }
    setSelectedVariations(newSelection);
  };

  const proceedToCardCreation = () => {
    if (selectedVariations.size === 0) {
      Alert.alert('No Selection', 'Please select at least one variation to proceed.');
      return;
    }

    const selectedVariationObjects = variations.filter(v => 
      selectedVariations.has(v.id)
    );

    navigation.navigate('CardOutput', {
      selectedVariations: selectedVariationObjects,
      sketches
    });
  };

  const renderSketchGroup = (sketch: Sketch) => {
    const sketchVariations = variations.filter(v => v.sketchId === sketch.id);
    
    return (
      <View key={sketch.id} style={styles.sketchGroup}>
        <View style={styles.sketchHeader}>
          <Text style={styles.sketchTitle}>
            {sketch.ocrText || 'Untitled Sketch'}
          </Text>
          <Text style={styles.sketchCategory}>
            {sketch.category || 'general'}
          </Text>
        </View>

        {currentlyGenerating === sketch.id ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.generatingText}>Generating variations...</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variationsScroll}>
            {sketchVariations.map(variation => (
              <TouchableOpacity
                key={variation.id}
                style={[
                  styles.variationCard,
                  selectedVariations.has(variation.id) && styles.selectedCard
                ]}
                onPress={() => toggleVariationSelection(variation.id)}
              >
                <Image source={{ uri: variation.imageUri }} style={styles.variationImage} />
                <View style={styles.variationOverlay}>
                  <Text style={styles.variationStyle}>{variation.style}</Text>
                  {selectedVariations.has(variation.id) && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Variations</Text>
        <TouchableOpacity
          style={[styles.nextButton, selectedVariations.size === 0 && styles.nextButtonDisabled]}
          onPress={proceedToCardCreation}
          disabled={selectedVariations.size === 0}
        >
          <Text style={[styles.nextButtonText, selectedVariations.size === 0 && styles.nextButtonTextDisabled]}>
            Next ({selectedVariations.size})
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Original Image Preview */}
      <View style={styles.originalImageContainer}>
        <Text style={styles.sectionTitle}>Original Capture</Text>
        <Image source={{ uri: originalImage }} style={styles.originalImage} />
      </View>

      {/* Variations Gallery */}
      <ScrollView style={styles.galleryContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Generated Variations</Text>
        
        {isLoading && currentlyGenerating === null ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing sketches...</Text>
          </View>
        ) : (
          sketches.map(renderSketchGroup)
        )}

        {!isLoading && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Tap variations to select them for card creation
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#888888',
  },
  originalImageContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  originalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  galleryContainer: {
    flex: 1,
    padding: 20,
  },
  sketchGroup: {
    marginBottom: 30,
  },
  sketchHeader: {
    marginBottom: 15,
  },
  sketchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sketchCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  variationsScroll: {
    marginHorizontal: -10,
  },
  variationCard: {
    width: cardWidth,
    height: cardWidth * 1.2,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#007AFF',
  },
  variationImage: {
    width: '100%',
    height: '80%',
  },
  variationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variationStyle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedIndicator: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  generatingContainer: {
    height: cardWidth * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  generatingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});