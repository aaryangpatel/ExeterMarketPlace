/**
 * EditItemsScreen - My Listings dashboard. Manage or delete posts.
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
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../theme/constants';

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

  const userItems = items.filter((i) => i.ownerEmail === user?.email);

  const handleUpdate = (id) => {
    const data = editForm[id];
    if (!data) return;
    updateDoc(doc(firestore, 'items', id), data)
      .then(() => {
        setEditingId(null);
        setEditForm((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      })
      .catch((err) => Alert.alert('Error', err.message ?? 'Update failed'));
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete item',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDoc(doc(firestore, 'items', id))
              .then(() => setEditingId(null))
              .catch((err) => Alert.alert('Error', err.message ?? 'Delete failed'));
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

  const handleMarkSold = (id) => {
    Alert.alert(
      'Mark as sold',
      'Mark this item as sold? It will be hidden from the main feed unless users enable "Show sold".',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Sold',
          onPress: () => {
            updateDoc(doc(firestore, 'items', id), { status: 'sold' })
              .catch((err) => Alert.alert('Error', err.message ?? 'Update failed'));
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
    const form = editForm[item.id] ?? {};

    return (
      <View style={styles.card}>
        {item.imageBase64 ? (
          <ExpoImage source={{ uri: item.imageBase64 }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          {isEditing ? (
            <>
              <TouchableOpacity style={styles.imageChangeBtn} onPress={() => handleChangeImage(item.id)}>
                <Text style={styles.imageChangeBtnText}>Change photo</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                defaultValue={item.title}
                onChangeText={(v) => handleInputChange(item.id, 'title', v)}
                placeholder="Title"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                defaultValue={item.description}
                onChangeText={(v) => handleInputChange(item.id, 'description', v)}
                placeholder="Description"
                multiline
              />
              <TextInput
                style={styles.input}
                defaultValue={item.price || 'Free'}
                onChangeText={(v) => handleInputChange(item.id, 'price', v)}
                placeholder="Price"
              />
              <TextInput
                style={styles.input}
                defaultValue={item.location}
                onChangeText={(v) => handleInputChange(item.id, 'location', v)}
                placeholder="Location"
              />
              <View style={styles.row}>
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
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.updateBtn}
                  onPress={() => handleUpdate(item.id)}
                >
                  <Text style={styles.updateBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowPrice}>{item.price || 'Free'}</Text>
              {(item.status === 'sold') && (
                <View style={styles.soldTag}>
                  <Text style={styles.soldTagText}>SOLD</Text>
                </View>
              )}
              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditingId(item.id)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {item.status !== 'sold' && (
                  <TouchableOpacity
                    style={styles.soldBtn}
                    onPress={() => handleMarkSold(item.id)}
                  >
                    <Text style={styles.soldBtnText}>Mark Sold</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
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
          <Text style={styles.emptyText}>No listings yet</Text>
          <Text style={styles.emptySubtext}>Post an item to get started</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Text style={styles.addBtnText}>Post an Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={userItems}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 600);
              }}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  addBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  addBtnText: { color: COLORS.surface, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  thumb: { width: '100%', height: 160, backgroundColor: COLORS.border },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  cardBody: { padding: SPACING.md },
  rowTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  rowPrice: { fontSize: FONT_SIZES.md, color: COLORS.primary, marginTop: SPACING.xs },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  imageChangeBtn: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageChangeBtnText: { color: COLORS.primary, fontWeight: '600', textAlign: 'center' },
  soldTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.text,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  soldTagText: { color: COLORS.surface, fontSize: 12, fontWeight: '700' },
  soldBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.textSecondary,
    alignItems: 'center',
  },
  soldBtnText: { color: COLORS.surface, fontWeight: '600' },
  editBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  editBtnText: { color: COLORS.surface, fontWeight: '600' },
  deleteBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.surface, fontWeight: '600' },
  cancelBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.text, fontWeight: '600' },
  updateBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  updateBtnText: { color: COLORS.surface, fontWeight: '600' },
});
