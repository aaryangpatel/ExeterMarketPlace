/**
 * AuthScreen - Professional sign in / sign up with easy switching.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../theme/constants';

export default function AuthScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const type = params?.type ?? 'signin';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = type === 'signup';

  const signUpWithEmail = () => {
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      Alert.alert('Error', 'Please enter all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) =>
        updateProfile(userCredential.user, { displayName: name.trim() }).then(
          () => userCredential
        )
      )
      .then(() => {
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      })
      .catch((err) => {
        Alert.alert('Error', err.message ?? 'Sign up failed.');
        setLoading(false);
      });
  };

  const signInWithEmail = () => {
    if (!email?.trim() || !password?.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setLoading(false);
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      })
      .catch((err) => {
        Alert.alert('Error', err.message ?? 'Sign in failed.');
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    if (isSignUp) signUpWithEmail();
    else signInWithEmail();
  };

  const switchMode = () => {
    navigation.replace(isSignUp ? 'SignIn' : 'SignUp');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Join Exeter Marketplace to buy and sell'
              : 'Sign in to message sellers and manage listings'}
          </Text>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'new-password' : 'password'}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={switchMode} disabled={loading}>
              <Text style={styles.switchLink}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.xs,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  switchLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
