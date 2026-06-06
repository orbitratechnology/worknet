import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { db } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import {
  addDoc,
  collection,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export interface WriteReviewSheetRef {
  open: () => void;
  close: () => void;
}

interface WriteReviewSheetProps {
  providerId: string;
  providerName: string;
  onSubmitted?: () => void;
}

export const WriteReviewSheet = forwardRef<
  WriteReviewSheetRef,
  WriteReviewSheetProps
>(function WriteReviewSheet({ providerId, providerName, onSubmitted }, ref) {
  const theme = useTheme();
  const { user, userProfile } = useAuth();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.present(),
    close: () => sheetRef.current?.dismiss(),
  }));

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, 'reviews'), {
        providerId,
        userId: user.uid,
        userName: userProfile?.name || user.displayName || 'User',
        userPhotoUrl: userProfile?.photoUrl || user.photoURL || '',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setComment('');
      setRating(5);
      sheetRef.current?.dismiss();
      onSubmitted?.();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Could not submit review. Try again.';
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBottomSheet ref={sheetRef} snapPoints={['58%']}>
      <View style={styles.container}>
        <BottomSheetHeader title={`Review ${providerName}`} />

        <View style={styles.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Pressable
              key={i}
              onPress={() => {
                Haptics.selectionAsync();
                setRating(i + 1);
              }}
              hitSlop={6}
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
              <Feather
                name='star'
                size={36}
                color={i < rating ? '#FFB300' : theme.border}
              />
            </Pressable>
          ))}
        </View>

        <ThemedText style={[styles.ratingLabel, { color: theme.subtext }]}>
          {rating === 5
            ? 'Excellent'
            : rating === 4
              ? 'Good'
              : rating === 3
                ? 'Average'
                : rating === 2
                  ? 'Below average'
                  : 'Poor'}
        </ThemedText>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder='Share your experience (optional)'
          placeholderTextColor={theme.subtext}
          multiline
          maxLength={500}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}
        />

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: theme.accent,
              opacity: pressed || submitting ? 0.85 : 1,
            },
          ]}>
          {submitting ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <ThemedText style={[styles.submitText, { color: theme.onAccent }]}>
              Submit Review
            </ThemedText>
          )}
        </Pressable>
      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.screenPadding,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
    paddingVertical: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  error: { fontSize: 13, marginBottom: 8 },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    minHeight: Layout.minTouch + 8,
  },
  submitText: { fontSize: 16, fontWeight: '700' },
});
