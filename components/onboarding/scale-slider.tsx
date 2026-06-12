import { useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  Text,
  View,
} from 'react-native';

export type ScaleSliderProps = {
  /** 항목 라벨 (예: "취침 시간") */
  label: string;
  /** 현재 값 라벨 (예: "보통(자정)") — 오른쪽 상단에 파란색으로 표시 */
  valueLabel: string;
  /** 좌측 끝 라벨 (예: "일찍 자요") */
  minLabel: string;
  /** 우측 끝 라벨 (예: "늦게 자요") */
  maxLabel: string;
  /** 1~steps 사이 정수. 미선택 시 중앙 표시. */
  value: number | null;
  steps?: number;
  onChange: (value: number) => void;
  /** 슬라이더 조작 완료(손 뗄 때) 콜백. 최종 선택값을 전달. */
  onSlidingComplete?: (value: number) => void;
};

/**
 * 와이어프레임 "생활 패턴" 스텝용 라벨형 척도 슬라이더.
 * 탭/드래그로 1~steps 값을 선택한다. (gesture 라이브러리 없이 PanResponder 사용)
 */
export function ScaleSlider({
  label,
  valueLabel,
  minLabel,
  maxLabel,
  value,
  steps = 5,
  onChange,
  onSlidingComplete,
}: ScaleSliderProps) {
  const [width, setWidth] = useState(0);
  const current = value ?? Math.ceil(steps / 2);
  const ratio = (current - 1) / (steps - 1);
  // 손 뗄 때 onSlidingComplete 로 전달할 마지막 선택값.
  const lastPicked = useRef<number | null>(value);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const pick = (locationX: number) => {
    if (width <= 0) return;
    const r = Math.max(0, Math.min(1, locationX / width));
    const next = Math.round(r * (steps - 1)) + 1;
    lastPicked.current = next;
    if (next !== value) onChange(next);
  };

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderGrant: (e: GestureResponderEvent) => pick(e.nativeEvent.locationX),
    onPanResponderMove: (e: GestureResponderEvent) => pick(e.nativeEvent.locationX),
    onPanResponderRelease: () => {
      if (lastPicked.current != null) onSlidingComplete?.(lastPicked.current);
    },
  });

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
        <Text className="text-sm font-medium text-[#256EF4]">{valueLabel}</Text>
      </View>

      {/* 트랙 (탭/드래그 영역) */}
      <View className="py-2" onLayout={onLayout} {...responder.panHandlers}>
        <View className="h-1 rounded-full bg-neutral-200">
          <View style={{ width: `${ratio * 100}%` }} className="h-1 rounded-full bg-[#256EF4]" />
        </View>
        <View
          style={{ left: `${ratio * 100}%`, marginLeft: -11 }}
          className="absolute top-0.5 h-5 w-5 rounded-full border-2 border-[#256EF4] bg-white"
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-neutral-400">{minLabel}</Text>
        <Text className="text-xs text-neutral-400">{maxLabel}</Text>
      </View>
    </View>
  );
}
