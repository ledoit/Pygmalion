import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { processImageWithSegmentAnything } from '../services/aiService';
import { Sketch } from '../types';

interface CaptureScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export default function CaptureScreen({ navigation }: CaptureScreenProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Image picker function
  const pickImage = async () => {
    try {
      // Request permission for image library access
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required', 
          'Please grant permission to access your photo library to upload images.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      });

      // Handle user cancellation
      if (result.canceled) {
        return;
      }

      // Process the selected image
      if (result.assets && result.assets[0]) {
        setIsProcessing(true);
        const imageUri = result.assets[0].uri;
        
        // Process the image with AI using the same pipeline as camera capture
        const sketches = await processImageWithSegmentAnything(imageUri);
        
        // Navigate to gallery with processed sketches
        navigation.navigate('Gallery', { 
          originalImage: imageUri,
          sketches 
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to process selected image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Camera permission handling for native platforms
  if (isNative && !permission) {
    return <View />;
  }

  if (isNative && !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo?.uri) {
        Alert.alert('Error', 'Failed to capture photo');
        return;
      }

      // Process the image with AI
      const sketches = await processImageWithSegmentAnything(photo.uri);
      
      // Navigate to gallery with processed sketches
      navigation.navigate('Gallery', { 
        originalImage: photo.uri,
        sketches 
      });

    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture and process image');
    } finally {
      setIsProcessing(false);
    }
  }

  // Web-specific render (no camera, upload only)
  if (!isNative) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.webHeader}
        >
          <TouchableOpacity
            style={styles.webBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.webHeaderTitle}>Upload Notebook Page</Text>
          <View style={styles.webHeaderSpacer} />
        </LinearGradient>

        {/* Web content */}
        <View style={styles.webContent}>
          <View style={styles.webInstructionsBox}>
            <Ionicons name="cloud-upload-outline" size={64} color="#007AFF" />
            <Text style={styles.webInstructionsTitle}>
              Upload Your Notebook Page
            </Text>
            <Text style={styles.webInstructionsText}>
              Select an image from your device to extract and process sketches
            </Text>
          </View>

          {isProcessing ? (
            <View style={styles.webProcessingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.webProcessingText}>Processing image...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.webUploadButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color="white" />
              <Text style={styles.webUploadButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Native render (camera + upload option)
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Notebook</Text>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Instructions overlay */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsText}>
              Position your notebook page in the frame
            </Text>
            <Text style={styles.instructionsSubtext}>
              Make sure sketches are clearly visible
            </Text>
          </View>
        </View>

        {/* Bottom controls */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomControls}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.processingText}>Processing image...</Text>
            </View>
          ) : (
            <View style={styles.controlsRow}>
              {/* Upload from Photos button */}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.uploadButtonText}>Photos</Text>
              </TouchableOpacity>

              {/* Camera capture button */}
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {/* Spacer for symmetry */}
              <View style={styles.controlsSpacer} />
            </View>
          )}
        </LinearGradient>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flipButton: {
    padding: 8,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  instructionsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomControls: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Web-specific styles
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  webBackButton: {
    padding: 8,
  },
  webHeaderTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  webHeaderSpacer: {
    width: 40,
  },
  webContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  webInstructionsBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webInstructionsTitle: {
    color: '#007AFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  webInstructionsText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  webProcessingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  webProcessingText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  webUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignSelf: 'center',
  },
  webUploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  controlsSpacer: {
    width: 10,
  },
});