import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import React, { useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { captureRef } from 'react-native-view-shot';

export default function Index() {
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const viewRef = useRef<View>(null);

  const pickImage = async (type: 'base' | 'watermark') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to use this feature.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 1,
    });

    if (!result.canceled) {
      if (type === 'base') {
        setBaseImage(result.assets[0].uri);
      } else {
        setWatermarkImage(result.assets[0].uri);
      }
    }
  };

  const saveWatermarkedImage = async () => {
    if (!baseImage || !watermarkImage) {
      Alert.alert('Error', 'Please select both base image and watermark image');
      return;
    }

    setIsLoading(true);
    
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions to save images.');
        setIsLoading(false);
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Watermarked image saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearImages = () => {
    setBaseImage(null);
    setWatermarkImage(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Simple Watermark App</Text>
        <Text style={styles.subtitle}>Add watermark to your images</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => pickImage('base')}>
          <Text style={styles.buttonText}>Select Base Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => pickImage('watermark')}>
          <Text style={styles.buttonText}>Select Watermark</Text>
        </TouchableOpacity>
      </View>

      {(baseImage || watermarkImage) && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview:</Text>
          
          <View ref={viewRef} style={styles.imageContainer}>
            {baseImage && (
              <Image source={{ uri: baseImage }} style={styles.baseImage} />
            )}
            {watermarkImage && (
              <Image source={{ uri: watermarkImage }} style={styles.watermarkImage} />
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={saveWatermarkedImage}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : 'Save Watermarked Image'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearImages}>
              <Text style={styles.buttonText}>Clear Images</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!baseImage && !watermarkImage && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            1. Select a base image{'\n'}
            2. Select a watermark image{'\n'}
            3. Preview the result{'\n'}
            4. Save to your gallery
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  baseImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  watermarkImage: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 80,
    height: 80,
    resizeMode: 'contain',
    opacity: 0.8,
  },
  actionButtons: {
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  instructionContainer: {
    padding: 30,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
  },
});