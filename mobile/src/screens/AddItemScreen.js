/**
 * AddItemScreen - Premium dark multi-step posting
 * Clean, formal design without emojis
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Other'];

const STEP_TITLES = {
  1: 'Photo',
  2: 'Details',
  3: 'Category',
};

export default function AddItemScreen({ navigation }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) navigation.replace('SignIn');
  }, [user, navigation]);
  
  if (!user) return null;

  const [step, setStep] = useState(1);
  const [imageUris, setImageUris] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
      base64: true,
    });
    if (!result.canceled && result.assets?.length) {
      const newImages = result.assets
        .map((a) => (a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri))
        .filter(Boolean);
      if (newImages.length) {
        setImageUris((prev) => [...prev, ...newImages].slice(0, 10));
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Required', 'Please allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const dataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      if (dataUri) {
        setImageUris((prev) => [...prev, dataUri].slice(0, 10));
      }
    }
  };

  const removeImage = (index) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        Alert.alert('Title Required', 'Please enter a title for your item.');
        return;
      }
      if (!description.trim()) {
        Alert.alert('Description Required', 'Please add a description for your item.');
        return;
      }
      setStep(3);
    }
  };

  const uriToBase64 = async (uri) => {
    if (!uri) return null;
    if (uri.startsWith('data:')) return uri;

    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    if (uri.startsWith('content://') && Platform.OS === 'android') {
      const tempPath = `${FileSystem.cacheDirectory}temp_img_${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: tempPath });
      const encoding = FileSystem.EncodingType?.Base64 ?? 'base64';
      const base64 = await FileSystem.readAsStringAsync(tempPath, { encoding });
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      return `data:image/jpeg;base64,${base64}`;
    }

    const encoding = FileSystem.EncodingType?.Base64 ?? 'base64';
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding });
    return `data:image/jpeg;base64,${base64}`;
  };

  const fetchImagesAsBase64 = async () => {
    if (!imageUris?.length) return [];
    const results = [];
    for (const uri of imageUris) {
      const b64 = await uriToBase64(uri);
      if (b64) results.push(b64);
    }
    return results;
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Category Required', 'Please select a category for your item.');
      return;
    }
    
    setLoading(true);
    try {
      const imagesBase64 = await fetchImagesAsBase64();
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: price.trim() || 'Free',
        location: location.trim() || '',
        contactInfo: user?.email ?? '',
        imagesBase64,
        imageBase64: imagesBase64[0] ?? null,
        owner: user?.displayName ?? 'Anonymous',
        ownerEmail: user?.email ?? '',
        category: category || 'Other',
        status: 'available',
        timestamp: serverTimestamp(),
      };
      await addDoc(collection(firestore, 'items'), payload);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to post item. Please try again.');
    }
    setLoading(false);
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressStepContainer}>
              <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.textInverse} />
                ) : (
                  <Text style={[styles.progressDotText, step >= s && styles.progressDotTextActive]}>
                    {s}
                  </Text>
                )}
              </View>
              <Text style={[styles.progressLabel, step >= s && styles.progressLabelActive]}>
                {STEP_TITLES[s]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.stepContent}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Add Photos</Text>
            <Text style={styles.stepSubtitle}>
              Photos help your item sell faster (optional)
            </Text>

            {imageUris.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailsScroll}
                contentContainerStyle={styles.thumbnailsContent}
              >
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.thumbnailWrapper}>
                    <Image
                      source={{ uri }}
                      style={styles.thumbnail}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeThumbnail}
                      onPress={() => removeImage(index)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={pickImages}
                activeOpacity={0.8}
              >
                <View style={styles.photoActionIcon}>
                  <Ionicons name="images-outline" size={24} color={COLORS.text} />
                </View>
                <Text style={styles.photoActionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <View style={styles.photoActionIcon}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.text} />
                </View>
                <Text style={styles.photoActionText}>Camera</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.uploadHint}>
              Up to 10 photos. Tap Gallery or Camera to add.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Item Details</Text>
            <Text style={styles.stepSubtitle}>
              Tell buyers about your item
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={[styles.input, focusedField === 'title' && styles.inputFocused]}
                placeholder="What are you selling?"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                maxLength={80}
              />
              <Text style={styles.charCount}>{title.length}/80</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  focusedField === 'description' && styles.inputFocused,
                ]}
                placeholder="Describe your item (condition, details, etc.)"
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                style={[styles.input, focusedField === 'price' && styles.inputFocused]}
                placeholder="$0 (or leave blank for Free)"
                placeholderTextColor={COLORS.textTertiary}
                value={price}
                onChangeText={setPrice}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
                keyboardType="default"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={[styles.input, focusedField === 'location' && styles.inputFocused]}
                placeholder="Where can buyers pick this up?"
                placeholderTextColor={COLORS.textTertiary}
                value={location}
                onChangeText={setLocation}
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Select Category</Text>
            <Text style={styles.stepSubtitle}>
              Help buyers find your item
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryCard, category === cat && styles.categoryCardActive]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryCardText, 
                    category === cat && styles.categoryCardTextActive
                  ]}>
                    {cat}
                  </Text>
                  {category === cat && (
                    <View style={styles.categoryCheck}>
                      <Ionicons name="checkmark" size={16} color={COLORS.textInverse} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => setStep(step - 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {step === 1 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => setStep(2)}
            activeOpacity={0.8}
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={step === 3 ? handleSubmit : handleNext}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textInverse} size="small" />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === 3 ? 'Post Item' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.huge,
  },

  // Progress Indicator
  progressContainer: {
    marginBottom: SPACING.xxl,
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginBottom: SPACING.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  progressDotText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textTertiary,
  },
  progressDotTextActive: {
    color: COLORS.background,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  progressLabelActive: {
    color: COLORS.text,
  },

  // Step Content
  stepContent: {
    marginBottom: SPACING.xxl,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },

  // Image Upload
  uploadHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  thumbnailsScroll: {
    marginBottom: SPACING.lg,
  },
  thumbnailsContent: {
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceElevated,
  },
  removeThumbnail: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  photoActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.md,
  },
  photoActionBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  photoActionIcon: {
    marginBottom: SPACING.sm,
  },
  photoActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },

  // Form Inputs
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },

  // Category Selection
  categoryGrid: {
    gap: SPACING.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  categoryCardActive: {
    borderColor: COLORS.text,
    backgroundColor: COLORS.surfaceElevated,
  },
  categoryCardText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  categoryCardTextActive: {
    fontWeight: FONT_WEIGHTS.semibold,
  },
  categoryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action Buttons
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  backBtn: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
  },
  nextBtn: {
    flex: 2,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textInverse,
  },
});
