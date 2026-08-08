import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** 이 거리(또는 그에 준하는 속도)만큼 아래로 끌면 닫는다. */
const DISMISS_DRAG_DISTANCE = 100;
const DISMISS_DRAG_VELOCITY = 0.6;

/**
 * 채팅 이미지 전체화면 뷰어 (Figma 3589:28288).
 * 디자인은 360×432 레터박스지만 실제 첨부는 비율이 제각각이라 `contain`으로 맞춘다.
 * 닫기: X 버튼 · 사진/배경 탭 · 아래로 스와이프 · Android 뒤로가기.
 */
export function ChatImageViewer({
  visible,
  imageUrl,
  title,
  onClose,
}: {
  visible: boolean;
  imageUrl?: string;
  title?: string;
  onClose: () => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      translateY.setValue(0);
    }
  }, [translateY, visible]);

  const dismiss = (toValue: number) => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(translateY, {
      toValue,
      duration: 160,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      // 탭은 Pressable에 넘기고, 세로 위주 드래그만 가로챈다.
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dy) > 12 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        // 위로는 살짝만 따라가게 저항을 준다.
        translateY.setValue(gesture.dy > 0 ? gesture.dy : gesture.dy / 4);
      },
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > DISMISS_DRAG_DISTANCE || gesture.vy > DISMISS_DRAG_VELOCITY) {
          dismiss(windowHeight);
          return;
        }
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  // 드래그 거리에 비례해 배경을 투명하게: 놓으면 닫힌다는 힌트.
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, windowHeight / 2],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible && Boolean(imageUrl)}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <Animated.View className="flex-1 bg-[#17171B]" style={{ opacity: backdropOpacity }} />
      <Animated.View
        className="absolute inset-0"
        style={{ transform: [{ translateY }] }}
        {...panResponder.panHandlers}
      >
        <SafeAreaView edges={['top']}>
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
              {title}
            </Text>
            {/* 타이틀을 가운데 유지하기 위한 좌측 버튼과 같은 폭의 빈 슬롯 */}
            <View className="w-6" />
          </View>
        </SafeAreaView>

        <Pressable
          className="flex-1 justify-center"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="사진 닫기"
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          ) : null}
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
