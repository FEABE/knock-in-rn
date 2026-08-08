import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FlatList, Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DISMISS_DRAG_DISTANCE = 100;
const DISMISS_DRAG_VELOCITY = 600;
const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * 검은 배경의 공통 전체화면 이미지 뷰어.
 * 기본 배율에서는 좌우 페이징과 아래 스와이프 종료, 확대 상태에서는 경계 내 이동을 지원한다.
 */
export function ChatImageViewer({
  visible,
  imageUrl,
  imageUrls,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  visible: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  index?: number;
  title?: string;
  onIndexChange?: (next: number) => void;
  onClose: () => void;
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const images = useMemo(
    () => (imageUrls?.length ? imageUrls.filter(Boolean) : imageUrl ? [imageUrl] : []),
    [imageUrl, imageUrls],
  );
  const [internalIndex, setInternalIndex] = useState(0);
  const [imageAreaHeight, setImageAreaHeight] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const listRef = useRef<FlatList<string>>(null);
  const dismissY = useSharedValue(0);
  const activeIndex = clampIndex(index ?? internalIndex, images.length);

  useEffect(() => {
    if (!visible) return;
    dismissY.value = 0;
    setZoomed(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: activeIndex * windowWidth, animated: false });
    });
  }, [activeIndex, dismissY, visible, windowWidth]);

  const changeIndex = (next: number) => {
    const safeIndex = clampIndex(next, images.length);
    setInternalIndex(safeIndex);
    setZoomed(false);
    onIndexChange?.(safeIndex);
  };

  const dismissGesture = Gesture.Pan()
    .enabled(!zoomed)
    .maxPointers(1)
    .activeOffsetY(12)
    .failOffsetX([-12, 12])
    .onUpdate((event) => {
      dismissY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DRAG_DISTANCE || event.velocityY > DISMISS_DRAG_VELOCITY) {
        dismissY.value = withTiming(windowHeight, { duration: 160 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        dismissY.value = withSpring(0);
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dismissY.value, [0, windowHeight / 2], [1, 0.3], Extrapolation.CLAMP),
  }));
  const viewerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dismissY.value }],
  }));
  const viewerTitle = images.length > 1 ? `${activeIndex + 1} / ${images.length}` : title;

  return (
    <Modal
      visible={visible && images.length > 0}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Reanimated.View className="flex-1 bg-[#17171B]" style={backdropStyle} />
        <Reanimated.View className="absolute inset-0" style={viewerStyle}>
          <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="h-[52px] flex-row items-center justify-between px-4">
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="사진 닫기"
                hitSlop={12}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
              <Text
                className="flex-1 text-center text-base font-semibold text-white"
                numberOfLines={1}
              >
                {viewerTitle}
              </Text>
              <View className="w-6" />
            </View>

            <GestureDetector gesture={dismissGesture}>
              <View
                className="flex-1"
                onLayout={(event) => setImageAreaHeight(event.nativeEvent.layout.height)}
              >
                <View className="flex-1" style={{ width: windowWidth }}>
                  <FlatList
                    ref={listRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    scrollEnabled={!zoomed}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(url, itemIndex) => `${url}-${itemIndex}`}
                    getItemLayout={(_data, itemIndex) => ({
                      length: windowWidth,
                      offset: windowWidth * itemIndex,
                      index: itemIndex,
                    })}
                    onMomentumScrollEnd={(event) => {
                      changeIndex(
                        Math.round(event.nativeEvent.contentOffset.x / Math.max(1, windowWidth)),
                      );
                    }}
                    renderItem={({ item, index: itemIndex }) => (
                      <ZoomableImage
                        imageUrl={item}
                        width={windowWidth}
                        height={imageAreaHeight}
                        active={itemIndex === activeIndex}
                        zoomed={itemIndex === activeIndex && zoomed}
                        dismissY={dismissY}
                        windowHeight={windowHeight}
                        onClose={onClose}
                        onZoomChange={setZoomed}
                      />
                    )}
                  />
                </View>
              </View>
            </GestureDetector>
          </View>
        </Reanimated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

function ZoomableImage({
  imageUrl,
  width,
  height,
  active,
  zoomed,
  dismissY,
  windowHeight,
  onClose,
  onZoomChange,
}: {
  imageUrl: string;
  width: number;
  height: number;
  active: boolean;
  zoomed: boolean;
  dismissY: { value: number };
  windowHeight: number;
  onClose: () => void;
  onZoomChange: (zoomed: boolean) => void;
}) {
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const sourceWidth = useSharedValue(0);
  const sourceHeight = useSharedValue(0);
  useEffect(() => {
    if (active) return;
    resetTransform(scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY);
  }, [active, savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY]);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, savedScale.value * event.scale));
      const scaleRatio = nextScale / savedScale.value;
      const focalX = event.focalX - width / 2;
      const focalY = event.focalY - height / 2;
      const bounds = imageBounds(sourceWidth.value, sourceHeight.value, width, height, nextScale);

      scale.value = nextScale;
      translateX.value = clamp(
        focalX - (focalX - savedTranslateX.value) * scaleRatio,
        -bounds.x,
        bounds.x,
      );
      translateY.value = clamp(
        focalY - (focalY - savedTranslateY.value) * scaleRatio,
        -bounds.y,
        bounds.y,
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= MIN_SCALE) {
        resetTransform(scale, savedScale, translateX, translateY, savedTranslateX, savedTranslateY);
        runOnJS(onZoomChange)(false);
        return;
      }
      const bounds = imageBounds(sourceWidth.value, sourceHeight.value, width, height, scale.value);
      const nextTranslateX = clamp(translateX.value, -bounds.x, bounds.x);
      const nextTranslateY = clamp(translateY.value, -bounds.y, bounds.y);
      translateX.value = withTiming(nextTranslateX);
      translateY.value = withTiming(nextTranslateY);
      savedTranslateX.value = nextTranslateX;
      savedTranslateY.value = nextTranslateY;
      runOnJS(onZoomChange)(true);
    });

  const pan = Gesture.Pan()
    .enabled(active && zoomed)
    .averageTouches(true)
    .onUpdate((event) => {
      if (scale.value <= MIN_SCALE) return;
      const bounds = imageBounds(sourceWidth.value, sourceHeight.value, width, height, scale.value);
      const nextTranslateY = savedTranslateY.value + event.translationY;
      translateX.value = clamp(savedTranslateX.value + event.translationX, -bounds.x, bounds.x);
      translateY.value = clamp(nextTranslateY, -bounds.y, bounds.y);
      dismissY.value = isDownwardSwipe(event.translationX, event.translationY)
        ? Math.max(0, nextTranslateY - bounds.y)
        : 0;
    })
    .onEnd((event) => {
      if (scale.value <= MIN_SCALE) return;
      const bounds = imageBounds(sourceWidth.value, sourceHeight.value, width, height, scale.value);
      const overflowY = Math.max(0, savedTranslateY.value + event.translationY - bounds.y);
      if (isDownwardSwipe(event.translationX, event.translationY) && overflowY > 0) {
        if (
          overflowY > DISMISS_DRAG_DISTANCE ||
          (overflowY > 12 && event.velocityY > DISMISS_DRAG_VELOCITY)
        ) {
          dismissY.value = withTiming(windowHeight, { duration: 160 }, (finished) => {
            if (finished) runOnJS(onClose)();
          });
        } else {
          dismissY.value = withSpring(0);
        }
      }
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
      <Reanimated.View style={[{ width, height }, animatedStyle]}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          onLoad={(event) => {
            sourceWidth.value = event.source.width;
            sourceHeight.value = event.source.height;
          }}
        />
      </Reanimated.View>
    </GestureDetector>
  );
}

function imageBounds(
  sourceWidth: number,
  sourceHeight: number,
  containerWidth: number,
  containerHeight: number,
  scale: number,
) {
  'worklet';
  if (!sourceWidth || !sourceHeight || !containerWidth || !containerHeight) return { x: 0, y: 0 };
  const fitScale = Math.min(containerWidth / sourceWidth, containerHeight / sourceHeight);
  const renderedWidth = sourceWidth * fitScale;
  const renderedHeight = sourceHeight * fitScale;
  return {
    x: Math.max(0, (renderedWidth * scale - containerWidth) / 2),
    y: Math.max(0, (renderedHeight * scale - containerHeight) / 2),
  };
}

function resetTransform(
  scale: { value: number },
  savedScale: { value: number },
  translateX: { value: number },
  translateY: { value: number },
  savedTranslateX: { value: number },
  savedTranslateY: { value: number },
) {
  'worklet';
  scale.value = withTiming(MIN_SCALE);
  savedScale.value = MIN_SCALE;
  translateX.value = withTiming(0);
  translateY.value = withTiming(0);
  savedTranslateX.value = 0;
  savedTranslateY.value = 0;
}

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

function isDownwardSwipe(translationX: number, translationY: number) {
  'worklet';
  return translationY > 0 && Math.abs(translationY) > Math.abs(translationX);
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.max(0, index));
}
