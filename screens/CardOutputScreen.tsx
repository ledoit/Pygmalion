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
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RenderedVariation, Sketch, ProductCard } from '../types';
import { generateCardContentWithGPT } from '../services/aiService';
import { saveProductCard } from '../services/supabase';
import { CATEGORIES, Category, saveClassificationCorrection } from '../services/classifier';

interface CardOutputScreenProps {
  navigation: any;
  route: {
    params: {
      selectedVariations: RenderedVariation[];
      sketches: Sketch[];
    };
  };
}

interface CardContent {
  title: string;
  tagline: string;
  isGenerating: boolean;
  isEditing: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

export default function CardOutputScreen({ navigation, route }: CardOutputScreenProps) {
  const { selectedVariations, sketches } = route.params;
  const [cardContents, setCardContents] = useState<Map<string, CardContent>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  
  // Category selection state
  const [selectedCategories, setSelectedCategories] = useState<Map<string, Category>>(new Map());
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [currentSketchId, setCurrentSketchId] = useState<string>('');

  useEffect(() => {
    generateAllCardContents();
    initializeCategories();
  }, []);

  const initializeCategories = () => {
    const initialCategories = new Map<string, Category>();
    sketches.forEach(sketch => {
      if (sketch.classification?.category) {
        initialCategories.set(sketch.id, sketch.classification.category);
      }
    });
    setSelectedCategories(initialCategories);
  };

  const openCategoryModal = (sketchId: string) => {
    setCurrentSketchId(sketchId);
    setCategoryModalVisible(true);
  };

  const selectCategory = async (category: Category) => {
    const sketch = sketches.find(s => s.id === currentSketchId);
    if (!sketch) return;

    const originalCategory = sketch.classification?.category;
    
    // Update the selected category
    setSelectedCategories(prev => new Map(prev.set(currentSketchId, category)));
    
    // Save correction if user changed the category
    if (originalCategory && originalCategory !== category) {
      await saveClassificationCorrection(
        currentSketchId,
        originalCategory,
        category,
        sketch.imageUri,
        sketch.ocrText
      );
    }
    
    setCategoryModalVisible(false);
    setCurrentSketchId('');
  };

  const generateAllCardContents = async () => {
    const newContents = new Map<string, CardContent>();

    for (const variation of selectedVariations) {
      // Initialize with loading state
      newContents.set(variation.id, {
        title: '',
        tagline: '',
        isGenerating: true,
        isEditing: false,
      });
    }
    setCardContents(new Map(newContents));

    // Generate content for each variation
    for (const variation of selectedVariations) {
      try {
        const sketch = sketches.find(s => s.id === variation.sketchId);
        if (!sketch) continue;

        const content = await generateCardContentWithGPT(variation, sketch);
        
        newContents.set(variation.id, {
          title: content.title,
          tagline: content.tagline,
          isGenerating: false,
          isEditing: false,
        });
        setCardContents(new Map(newContents));
      } catch (error) {
        console.error('Error generating content for variation:', variation.id, error);
        newContents.set(variation.id, {
          title: 'Untitled Product',
          tagline: 'Generated concept card',
          isGenerating: false,
          isEditing: false,
        });
        setCardContents(new Map(newContents));
      }
    }
  };

  const updateCardContent = (variationId: string, field: 'title' | 'tagline', value: string) => {
    const newContents = new Map(cardContents);
    const current = newContents.get(variationId);
    if (current) {
      newContents.set(variationId, {
        ...current,
        [field]: value,
      });
      setCardContents(newContents);
    }
  };

  const toggleEdit = (variationId: string) => {
    const newContents = new Map(cardContents);
    const current = newContents.get(variationId);
    if (current) {
      newContents.set(variationId, {
        ...current,
        isEditing: !current.isEditing,
      });
      setCardContents(newContents);
    }
  };

  const saveCard = async (variation: RenderedVariation) => {
    const content = cardContents.get(variation.id);
    if (!content) return;

    const sketch = sketches.find(s => s.id === variation.sketchId);
    if (!sketch) return;

    try {
      setIsSaving(true);
      
      const selectedCategory = selectedCategories.get(sketch.id) || sketch.classification?.category || 'decorations';
      
      const cardData = {
        sketchId: variation.sketchId,
        renderedVariationId: variation.id,
        imageUri: variation.imageUri,
        title: content.title,
        tagline: content.tagline,
        category: selectedCategory,
      };

      const savedCard = await saveProductCard(cardData);
      
      if (savedCard) {
        setSavedCards(prev => new Set([...prev, variation.id]));
        Alert.alert('Success', 'Card saved to TasteMatch database!');
      } else {
        Alert.alert('Error', 'Failed to save card. Please try again.');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllCards = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const variation of selectedVariations) {
      if (savedCards.has(variation.id)) continue;

      const content = cardContents.get(variation.id);
      const sketch = sketches.find(s => s.id === variation.sketchId);
      
      if (!content || !sketch) {
        errorCount++;
        continue;
      }

      try {
        const cardData = {
          sketchId: variation.sketchId,
          renderedVariationId: variation.id,
          imageUri: variation.imageUri,
          title: content.title,
          tagline: content.tagline,
          category: selectedCategories.get(sketch.id) || sketch.classification?.category || 'decorations',
        };

        const savedCard = await saveProductCard(cardData);
        
        if (savedCard) {
          setSavedCards(prev => new Set([...prev, variation.id]));
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error saving card:', variation.id, error);
        errorCount++;
      }
    }

    setIsSaving(false);
    
    if (successCount > 0) {
      Alert.alert(
        'Cards Saved',
        `${successCount} card(s) saved successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}!`,
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('History'),
          },
          { text: 'OK' }
        ]
      );
    } else if (errorCount > 0) {
      Alert.alert('Error', 'Failed to save cards. Please check your connection and try again.');
    }
  };

  const renderCard = (variation: RenderedVariation) => {
    const content = cardContents.get(variation.id);
    const sketch = sketches.find(s => s.id === variation.sketchId);
    const isSaved = savedCards.has(variation.id);

    if (!content) return null;

    return (
      <View key={variation.id} style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Card Image */}
          <Image source={{ uri: variation.imageUri }} style={styles.cardImage} />
          
          {/* Card Content */}
          <View style={styles.cardContent}>
            {content.isEditing ? (
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.titleInput}
                  value={content.title}
                  onChangeText={(text) => updateCardContent(variation.id, 'title', text)}
                  placeholder="Product title"
                  multiline
                />
                <TextInput
                  style={styles.taglineInput}
                  value={content.tagline}
                  onChangeText={(text) => updateCardContent(variation.id, 'tagline', text)}
                  placeholder="Product tagline"
                  multiline
                />
              </View>
            ) : (
              <View style={styles.contentDisplay}>
                {content.isGenerating ? (
                  <View style={styles.generatingContent}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.generatingText}>Generating content...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardTitle}>{content.title}</Text>
                    <Text style={styles.cardTagline}>{content.tagline}</Text>
                  </>
                )}
              </View>
            )}

            {/* Card Metadata */}
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Style:</Text>
                <Text style={styles.metaValue}>{variation.style}</Text>
              </View>
              
              {/* Category with prediction info */}
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Category:</Text>
                <TouchableOpacity 
                  style={styles.categorySelector}
                  onPress={() => openCategoryModal(sketch?.id || '')}
                >
                  <Text style={styles.categoryValue}>
                    {selectedCategories.get(sketch?.id || '') || sketch?.classification?.category || 'decorations'}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              {/* Show classification confidence if available */}
              {sketch?.classification && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>AI Confidence:</Text>
                  <Text style={[
                    styles.metaValue,
                    { color: sketch.classification.confidence > 0.8 ? '#28a745' : 
                             sketch.classification.confidence > 0.6 ? '#ffc107' : '#dc3545' }
                  ]}>
                    {Math.round(sketch.classification.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleEdit(variation.id)}
              disabled={content.isGenerating}
            >
              <Ionicons 
                name={content.isEditing ? "checkmark" : "pencil"} 
                size={20} 
                color="#007AFF" 
              />
              <Text style={styles.actionButtonText}>
                {content.isEditing ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, isSaved && styles.savedButton]}
              onPress={() => saveCard(variation)}
              disabled={content.isGenerating || isSaved || isSaving}
            >
              <Ionicons 
                name={isSaved ? "checkmark-circle" : "cloud-upload"} 
                size={20} 
                color={isSaved ? "#28a745" : "#007AFF"} 
              />
              <Text style={[styles.actionButtonText, isSaved && styles.savedButtonText]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <Text style={styles.headerTitle}>Product Cards</Text>
        <TouchableOpacity
          style={[styles.saveAllButton, isSaving && styles.saveAllButtonDisabled]}
          onPress={saveAllCards}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveAllButtonText}>Save All</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Cards List */}
      <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          Generated Cards ({selectedVariations.length})
        </Text>
        
        {selectedVariations.map(renderCard)}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoriesList}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryOption}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={styles.categoryOptionText}>{category}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  saveAllButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveAllButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: cardWidth * 0.6,
  },
  cardContent: {
    padding: 16,
  },
  editingContainer: {
    marginBottom: 12,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    paddingVertical: 8,
    marginBottom: 12,
  },
  taglineInput: {
    fontSize: 14,
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    paddingVertical: 8,
  },
  contentDisplay: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  cardTagline: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  generatingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  categoryValue: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  savedButton: {
    backgroundColor: '#f8fff9',
  },
  savedButtonText: {
    color: '#28a745',
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  categoriesList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});