import { ThemedText } from '@/components/themed-text';
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet';
import { BottomSheetHeader } from '@/components/ui/bottom-sheet-header';
import { Layout } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import {
  submitContentReport,
  type ReportTargetType,
} from '@/lib/submit-report';
import { getUserFacingMessage } from '@/lib/user-errors';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export type ReportContentSheetRef = {
  open: (params: {
    targetType: ReportTargetType;
    targetId: string;
    providerId?: string;
    title?: string;
  }) => void;
  close: () => void;
};

const REASONS = [
  'Spam or scam',
  'Harassment or hate speech',
  'False or misleading information',
  'Inappropriate content',
  'Other',
];

export const ReportContentSheet = forwardRef<ReportContentSheetRef>(
  function ReportContentSheet(_props, ref) {
    const theme = useTheme();
    const { user } = useAuth();
    const sheetRef = useRef<BottomSheetModal>(null);
    const [targetType, setTargetType] = useState<ReportTargetType>('review');
    const [targetId, setTargetId] = useState('');
    const [providerId, setProviderId] = useState<string | undefined>();
    const [title, setTitle] = useState('Report content');
    const [customReason, setCustomReason] = useState('');
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (params) => {
        setTargetType(params.targetType);
        setTargetId(params.targetId);
        setProviderId(params.providerId);
        setTitle(params.title ?? 'Report content');
        setCustomReason('');
        setSelectedReason(null);
        setError(null);
        setSubmitted(false);
        sheetRef.current?.present();
      },
      close: () => sheetRef.current?.dismiss(),
    }));

    const submit = async (reason: string) => {
      if (!user) return;
      setSubmitting(true);
      setError(null);
      try {
        await submitContentReport({
          reporterId: user.uid,
          targetType,
          targetId,
          providerId,
          reason,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSubmitted(true);
      } catch (e) {
        setError(getUserFacingMessage(e, 'report'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <AppBottomSheet ref={sheetRef} snapPoints={['55%', '75%']}>
        <BottomSheetHeader title={title} />
        <View style={styles.body}>
          {submitted ? (
            <View style={styles.successBlock}>
              <ThemedText style={styles.successTitle} type='defaultSemiBold'>
                Report received
              </ThemedText>
              <ThemedText style={{ color: theme.subtext, textAlign: 'center' }}>
                Thanks for helping keep Worknet safe. We review reports within 24–48
                hours. You can also email admin@orbitratech.net.
              </ThemedText>
            </View>
          ) : (
            <>
              <ThemedText style={{ color: theme.subtext, marginBottom: 12 }}>
                Why are you reporting this?
              </ThemedText>
              <View style={styles.reasonList}>
                {REASONS.map((reason) => (
                  <Pressable
                    key={reason}
                    style={({ pressed }) => [
                      styles.reasonRow,
                      {
                        borderColor: theme.border,
                        backgroundColor:
                          selectedReason === reason ? theme.muted : theme.card,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => {
                      setSelectedReason(reason);
                      if (reason !== 'Other') {
                        void submit(reason);
                      }
                    }}
                    disabled={submitting}>
                    <ThemedText type='defaultSemiBold'>{reason}</ThemedText>
                  </Pressable>
                ))}
              </View>
              {selectedReason === 'Other' ? (
                <View style={styles.customBlock}>
                  <TextInput
                    placeholder='Describe the issue'
                    placeholderTextColor={theme.subtext}
                    value={customReason}
                    onChangeText={setCustomReason}
                    multiline
                    style={[
                      styles.input,
                      {
                        borderColor: theme.border,
                        color: theme.text,
                        backgroundColor: theme.card,
                      },
                    ]}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitBtn,
                      { backgroundColor: theme.text, opacity: pressed ? 0.9 : 1 },
                    ]}
                    onPress={() => submit(customReason)}
                    disabled={submitting || customReason.trim().length < 3}>
                    {submitting ? (
                      <ActivityIndicator color={theme.onAccent} />
                    ) : (
                      <ThemedText
                        style={{ color: theme.onAccent, fontWeight: '600' }}>
                        Submit report
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
              ) : submitting ? (
                <ActivityIndicator style={{ marginTop: 16 }} color={theme.accent} />
              ) : null}
              {error ? (
                <ThemedText style={{ color: theme.error, marginTop: 12 }}>
                  {error}
                </ThemedText>
              ) : null}
            </>
          )}
        </View>
      </AppBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  body: { padding: Layout.screenPadding, gap: 8 },
  reasonList: { gap: 8 },
  reasonRow: {
    padding: 14,
    borderRadius: Layout.cardRadius,
    borderWidth: 1,
    borderCurve: 'continuous',
    minHeight: Layout.minTouch,
    justifyContent: 'center',
  },
  customBlock: { gap: 12, marginTop: 8 },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Layout.cardRadius,
    borderCurve: 'continuous',
    padding: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    minHeight: Layout.minTouch,
    borderRadius: Layout.chipRadius,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBlock: { gap: 12, paddingVertical: 24, alignItems: 'center' },
  successTitle: { fontSize: 18 },
});
