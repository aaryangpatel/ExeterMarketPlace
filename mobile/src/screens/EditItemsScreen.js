/**
 * EditItemsScreen - Premium dark listings management
 * Clean, formal design without emojis
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../theme/constants';

export default function EditItemsScreen({ route, navigation }) {
  const { items } = route.params ?? { items: [] };
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) navigation.replace('SignIn');
  }, [user, navigation]);
  
  if (!user) return null;

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const userItems = items.filter((i) => i.ownerEmail === user?.email);

  const handleUpdate = async (id) => {
    const data = editForm[id];
    if (!data) return;
    
    setSavingId(id);
    try {
      await updateDoc(doc(firestore, 'items', id), data);
      setEditingId(null);
      setEditForm((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update item. Please try again.');
    }
    setSavingId(null);
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'items', id));
              setEditingId(null);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleInputChange = (id, field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [field]: value },
    }));
  };

  const handleMarkSold = (id, title) => {
    Alert.alert(
      'Mark as Sold',
      `Mark "${title}" as sold? It will be hidden from the main feed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Sold',
          onPress: async () => {
            try {
              await updateDoc(doc(firestore, 'items', id), { status: 'sold' });
            } catch (err) {
              Alert.alert('Error', 'Failed to update item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleChangeImage = async (id) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (result.canceled) return;
    
    const uri = result.assets[0].uri;
    let base64 = uri;
    
    if (!uri.startsWith('data:')) {
      if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        base64 = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } else {
        const enc = FileSystem.EncodingType?.Base64 ?? 'base64';
        const b = await FileSystem.readAsStringAsync(uri, { encoding: enc });
        base64 = `data:image/jpeg;base64,${b}`;
      }
    }
    handleInputChange(id, 'imageBase64', base64);
  };

  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;
    const isSaving = savingId === item.id;
    const isSold = item.status === 'sold';

    return (
      <View style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {item.imageBase64 ? (
            <ExpoImage 
              source={{ uri: editForm[item.id]?.imageBase64 || item.imageBase64 }} 
              style={styles.image} 
              contentFit="cover" 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color={COLORS.textTertiary} />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          {isSold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={styles.changeImageBtn} 
                onPress={() => handleChangeImage(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={18} color={COLORS.text} />
                <Text style={styles.changeImageBtnText}>Change Photo</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  defaultValue={item.title}
                  onChangeText={(v) => handleInputChange(item.id, 'title', v)}
                  placeholder="Title"
                  placeholderTextColor={COLORS.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  defaultValue={item.description}
                  onChangeText={(v) => handleInputChange(item.id, 'description', v)}
                  placeholder="Description"
                  placeholderTextColor={COLORS.textTertiary}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price</Text>
                  <TextInput
                    style={styles.input}
                    defaultValue={item.price || 'Free'}
                    onChangeText={(v) => handleInputChange(item.id, 'price', v)}
                    placeholder="Price"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.md }]}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    defaultValue={item.location}
                    onChangeText={(v) => handleInputChange(item.id, 'location', v)}
                    placeholder="Location"
                    placeholderTextColor={COLORS.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditingId(null);
                    setEditForm((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                  onPress={() => handleUpdate(item.id)}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color={COLORS.textInverse} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={[styles.itemPrice, isSold && styles.itemPriceSold]}>
                {isSold ? 'Sold' : item.price || 'Free'}
              </Text>
              {item.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textTertiary} />
                  <Text style={styles.itemLocation}>{item.location}</Text>
                </View>
              )}

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditingId(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {!isSold && (
                  <TouchableOpacity
                    style={styles.soldBtn}
                    onPress={() => handleMarkSold(item.id, item.title)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.soldBtnText}>Mark Sold</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.title)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {userItems.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cube-outline" size={32} color={COLORS.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Post your first item to start selling
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('AddItem')}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyBtnText}>Post an Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userItems}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 600);
              }}
              tintColor={COLORS.text}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.huge,
  },

  // Empty State
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxxl,
    borderRadius: RADIUS.sm,
  },
  emptyBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  soldBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.soldBadge,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.xs,
  },
  soldBadgeText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 1,
  },
  cardContent: {
    padding: SPACING.lg,
  },

  // Item Display
  itemTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.priceGreen,
    marginBottom: SPACING.sm,
  },
  itemPriceSold: {
    color: COLORS.sold,
    textDecorationLine: 'line-through',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  itemLocation: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // Item Actions
  itemActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  editBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  soldBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soldBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Edit Form
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changeImageBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
  },
  inputRow: {
    flexDirection: 'row',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
