import { Colors } from '@/constants/theme';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: string[];
  index?: number;
  enableDynamicSizing?: boolean;
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  ({ children, snapPoints, index = 0, enableDynamicSizing }, ref) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const defaultSnapPoints = useMemo(() => ['50%', '75%', '90%'], []);
    const finalSnapPoints = snapPoints ?? defaultSnapPoints;

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={colorScheme === 'light' ? 0.45 : 0.65}
        />
      ),
      [colorScheme],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={index}
        snapPoints={enableDynamicSizing ? undefined : finalSnapPoints}
        enableDynamicSizing={enableDynamicSizing}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={[
          styles.indicator,
          { backgroundColor: theme.border },
        ]}
        backgroundStyle={[
          styles.background,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}>
        <BottomSheetView style={styles.content}>
          <View collapsable={false} style={styles.inner}>
            {children}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderCurve: 'continuous',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
