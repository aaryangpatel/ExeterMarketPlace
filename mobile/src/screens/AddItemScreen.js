/**
 * AddItemScreen - Multi-step Post an Item flow.
 * Step 1: Image Upload → Step 2: Details → Step 3: Category
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../theme/constants';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Furniture', 'Sports', 'Other'];

export default function AddItemScreen({ navigation }) {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) navigation.replace('SignIn');
  }, [user, navigation]);
  if (!user) return null;
  const [step, setStep] = useState(1);
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    }).then((result) => {
      if (!result.canceled) setImageUri(result.assets[0].uri);
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!imageUri) {
        Alert.alert('Image required', 'Please add a photo of your item.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !description.trim()) {
        Alert.alert('Required fields', 'Please enter title and description.');
        return;
      }
      setStep(3);
    } else {
      handleSubmit();
    }
  };

  const fetchImageAsBase64 = async () => {
    if (!imageUri) return null;
    if (imageUri.startsWith('data:')) return imageUri;

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    const encoding = FileSystem.EncodingType?.Base64 ?? 'base64';
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding });
    return `data:image/jpeg;base64,${base64}`;
  };

  const handleSubmitAsync = async () => {
    if (!category) {
      Alert.alert('Category required', 'Please select a category.');
      return;
    }
    setLoading(true);
    fetchImageAsBase64()
      .then((base64) =>
        addDoc(collection(firestore, 'items'), {
          title: title.trim(),
          description: description.trim(),
          price: price.trim() || 'Free',
          location: location.trim() || '',
          contactInfo: user?.email ?? '',
          imageBase64: base64,
          owner: user?.displayName ?? 'Anonymous',
          ownerEmail: user?.email ?? '',
          category: category || 'Other',
          status: 'available',
          timestamp: serverTimestamp(),
        })
      )
      .then(() => {
        setLoading(false);
        navigation.goBack();
      })
      .catch((err) => {
        Alert.alert('Error', err.message ?? 'Failed to post item.');
        setLoading(false);
      });
  };

  const onStep3Next = () => {
    if (!category) {
      Alert.alert('Category required', 'Please select a category.');
      return;
    }
    handleSubmitAsync();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.steps}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
      </View>
      <Text style={styles.stepLabel}>
        Step {step}: {step === 1 ? 'Image' : step === 2 ? 'Details' : 'Category'}
      </Text>

      {step === 1 && (
        <View style={styles.stepContent}>
          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            {imageUri ? (
              <Text style={styles.imageBtnText}>Change photo</Text>
            ) : (
              <Text style={styles.imageBtnText}>+ Add photo</Text>
            )}
          </TouchableOpacity>
          {imageUri && (
            <Text style={styles.imageHint}>Photo added ✓</Text>
          )}
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContent}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor={COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Price (or Free)"
            placeholderTextColor={COLORS.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="default"
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor={COLORS.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContent}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
          onPress={step === 3 ? onStep3Next : handleNext}
          disabled={loading}
        >
          <Text style={styles.nextBtnText}>
            {loading ? '...' : step === 3 ? 'Post Item' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  stepLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  stepContent: { marginBottom: SPACING.xl },
  imageBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    padding: SPACING.xl * 2,
    alignItems: 'center',
  },
  imageBtnText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  imageHint: { marginTop: SPACING.sm, color: COLORS.success, fontSize: FONT_SIZES.sm },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  catBtn: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(200,16,46,0.08)' },
  catBtnText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  catBtnTextActive: { color: COLORS.primary, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  backBtn: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.text, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextBtnText: { color: COLORS.surface, fontWeight: '600' },
});
