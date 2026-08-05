import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

const BRAND = '#256EF4';
const DOT_COUNT = 3;
const DOT_STAGGER_MS = 160;
const DOT_FADE_MS = 320;

/** 검색 로딩 인디케이터 — 파란 점 3개가 순차적으로 깜빡인다. (디자인 3269:19732) */
export function SearchLoadingDots({ className = '' }: { className?: string }) {
  const values = useRef(Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.25))).current;

  useEffect(() => {
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * DOT_STAGGER_MS),
          Animated.timing(value, {
            toValue: 1,
            duration: DOT_FADE_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.25,
            duration: DOT_FADE_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - 1 - index) * DOT_STAGGER_MS),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [values]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="검색 중"
      className={`flex-row items-center justify-center gap-2 ${className}`}
    >
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: BRAND,
            opacity: value,
          }}
        />
      ))}
    </View>
  );
}
