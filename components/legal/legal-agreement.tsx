import { ThemedText } from '@/components/themed-text';
import { LEGAL_URLS } from '@/lib/legal-urls';
import { useTheme } from '@/hooks/use-theme';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export function LegalAgreement() {
  const theme = useTheme();

  const open = (url: string) => {
    void WebBrowser.openBrowserAsync(url);
  };

  return (
    <View style={styles.wrap}>
      <ThemedText style={[styles.text, { color: theme.subtext }]}>
        By continuing, you agree to our{' '}
      </ThemedText>
      <Pressable onPress={() => open(LEGAL_URLS.terms)} hitSlop={8}>
        <ThemedText style={[styles.link, { color: theme.accent }]}>
          Terms of Service
        </ThemedText>
      </Pressable>
      <ThemedText style={[styles.text, { color: theme.subtext }]}> and </ThemedText>
      <Pressable onPress={() => open(LEGAL_URLS.privacy)} hitSlop={8}>
        <ThemedText style={[styles.link, { color: theme.accent }]}>
          Privacy Policy
        </ThemedText>
      </Pressable>
      <ThemedText style={[styles.text, { color: theme.subtext }]}>.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 16,
  },
  text: { fontSize: 13, lineHeight: 20 },
  link: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
});
