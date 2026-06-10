import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { downloadImageToGallery } from '@/lib/download-image';
import { useTheme } from '@/hooks/use-theme';
import { Galeria } from '@nandorojo/galeria';
import { Image } from 'expo-image';
import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

const SAMPLE_ASPECT = 5 / 4;

type WorkSamplesCarouselProps = {
  samples: string[];
};

export function WorkSamplesCarousel({ samples }: WorkSamplesCarouselProps) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth;
  const slideHeight = slideWidth * SAMPLE_ASPECT;
  const [activeIndex, setActiveIndex] = useState(0);
  const viewerIndexRef = useRef(0);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / slideWidth,
      );
      setActiveIndex(index);
    },
    [slideWidth],
  );

  if (samples.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.sectionTitle} type='headline' selectable>
          Recent work
        </ThemedText>
        <ThemedText
          style={[styles.counter, { color: theme.subtext }]}
          selectable>
          {activeIndex + 1} / {samples.length}
        </ThemedText>
      </View>

      <Galeria urls={samples} theme='dark'>
        <FlatList
          data={samples}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          keyExtractor={(url, index) => `work-sample-${index}-${url}`}
          getItemLayout={(_, index) => ({
            length: slideWidth,
            offset: slideWidth * index,
            index,
          })}
          renderItem={({ item: url, index }) => (
            <Galeria.Image
              index={index}
              rightNavItemIconName='square.and.arrow.down'
              onPressRightNavItemIcon={() => {
                viewerIndexRef.current = index;
                void downloadImageToGallery(url);
              }}
              onIndexChange={(event) => {
                viewerIndexRef.current = event.nativeEvent.currentIndex;
              }}
              style={{ width: slideWidth, height: slideHeight }}>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={`View work sample ${index + 1}`}
                style={{ width: slideWidth, height: slideHeight }}>
                <Image
                  source={url}
                  style={[
                    styles.slideImage,
                    {
                      width: slideWidth,
                      height: slideHeight,
                      backgroundColor: theme.muted,
                    },
                  ]}
                  contentFit='cover'
                  transition={200}
                  recyclingKey={url}
                />
              </Pressable>
            </Galeria.Image>
          )}
        />
      </Galeria>

      {samples.length > 1 ? (
        <View style={styles.dots}>
          {samples.map((url, index) => (
            <View
              key={`dot-${url}`}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? theme.text : theme.border,
                  width: index === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginHorizontal: -Layout.screenPadding,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
  },
  sectionTitle: {
    letterSpacing: -0.3,
  },
  counter: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  slideImage: {
    borderCurve: 'continuous',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  dot: {
    height: 6,
    borderRadius: 999,
    borderCurve: 'continuous',
  },
});
