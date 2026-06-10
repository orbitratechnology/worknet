import { ThemedView } from '@/components/themed-view';
import { useScreenInsets } from '@/hooks/use-screen-insets';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

type ScreenShellProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Include bottom safe-area padding inside the shell (auth screens). */
  safeBottom?: boolean;
};

export function ScreenShell({
  children,
  style,
  safeBottom = false,
}: ScreenShellProps) {
  const { top, bottom, left, right } = useScreenInsets();

  return (
    <ThemedView style={[styles.root, style]}>
      <View
        style={[
          styles.content,
          {
            paddingTop: top,
            paddingBottom: safeBottom ? bottom : 0,
            paddingLeft: left,
            paddingRight: right,
          },
        ]}>
        {children}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
