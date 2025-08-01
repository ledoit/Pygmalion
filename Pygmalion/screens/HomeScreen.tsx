import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>Pygmalion</Text>
          <Text style={styles.appSubtitle}>
            Transform notebook sketches into product concepts
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* Primary Action */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Capture')}
        >
          <LinearGradient
            colors={['#007AFF', '#0051D5']}
            style={styles.primaryButtonGradient}
          >
            <Ionicons name="camera" size={32} color="white" />
            <Text style={styles.primaryButtonText}>Capture Notebook</Text>
            <Text style={styles.primaryButtonSubtext}>
              Take a photo of your sketches to get started
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('History')}
          >
            <View style={styles.secondaryButtonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="folder-open" size={24} color="#007AFF" />
              </View>
              <Text style={styles.secondaryButtonText}>View History</Text>
              <Text style={styles.secondaryButtonSubtext}>
                Browse your generated cards
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              // In a full app, this might navigate to settings or info
              navigation.navigate('History');
            }}
          >
            <View style={styles.secondaryButtonContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="stats-chart" size={24} color="#28a745" />
              </View>
              <Text style={styles.secondaryButtonText}>My Cards</Text>
              <Text style={styles.secondaryButtonSubtext}>
                Manage saved concepts
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.sectionTitle}>How it works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="camera-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>1. Capture</Text>
                <Text style={styles.stepDescription}>
                  Take a photo of your notebook page with sketches
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="scan-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>2. Process</Text>
                <Text style={styles.stepDescription}>
                  AI detects sketches and extracts text automatically
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="color-palette-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>3. Generate</Text>
                <Text style={styles.stepDescription}>
                  Create multiple rendered variations of each sketch
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name="card-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>4. Save</Text>
                <Text style={styles.stepDescription}>
                  Export as TasteMatch-ready product cards
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  primaryButton: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  secondaryButtonContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  howItWorksContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f6ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});