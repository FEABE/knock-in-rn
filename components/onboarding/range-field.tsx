import { useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  Text,
  View,
} from 'react-native';

import { RangeSlider, type RangeValue } from '@/components/ui/headless';

export type RangeFieldProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  /** 끝 눈금 라벨 (예: "0만", "2,000만") */
  minTick: string;
  maxTick: string;
  /** 값 버블 포맷 (예: (lo,hi) => `${lo}~${hi}만원`) */
  formatBubble: (lo: number, hi: number) => string;
};

/**
 * 와이어프레임 "방 조건" 스텝의 보증금/월세/관리비용 범위 슬라이더.
 * RangeSlider(headless) 위에 트랙·두 개의 썸·값 버블을 직접 렌더한다.
 */
export function RangeField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  minTick,
  maxTick,
  formatBubble,
}: RangeFieldProps) {
  const [width, setWidth] = useState(0);
  const activeThumb = useRef<0 | 1>(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <RangeSlider
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onChange}
      className="gap-2"
    >
      {({ value: v, percents, setStart, setEnd }) => {
        const valueAt = (locationX: number) => {
          const r = Math.max(0, Math.min(1, locationX / (width || 1)));
          return Math.round((min + r * (max - min)) / step) * step;
        };
        const responder = PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > Math.abs(g.dy),
          onPanResponderGrant: (e: GestureResponderEvent) => {
            const next = valueAt(e.nativeEvent.locationX);
            // 더 가까운 썸을 활성화
            activeThumb.current = Math.abs(next - v[0]) <= Math.abs(next - v[1]) ? 0 : 1;
            if (activeThumb.current === 0) setStart(next);
            else setEnd(next);
          },
          onPanResponderMove: (e: GestureResponderEvent) => {
            const next = valueAt(e.nativeEvent.locationX);
            if (activeThumb.current === 0) setStart(next);
            else setEnd(next);
          },
        });

        // 트랙은 글자와 동일한 전체폭. 썸은 [0, width-THUMB] 범위에서만 이동해
        // 양 끝에서도 컨테이너를 벗어나지 않는다. (px 기반)
        const THUMB = 16;
        const usable = Math.max(0, width - THUMB);
        // percents 는 0~100 스케일.
        const loX = (percents[0] / 100) * usable;
        const hiX = (percents[1] / 100) * usable;
        const loCenter = loX + THUMB / 2;
        const hiCenter = hiX + THUMB / 2;

        return (
          <View className="gap-3">
            <Text className="text-sm font-semibold text-neutral-800">{label}</Text>

            {/* 값 버블 */}
            <View className="h-6">
              <View
                style={{ left: (loCenter + hiCenter) / 2, transform: [{ translateX: -56 }] }}
                className="absolute w-28 items-center"
              >
                <View className="rounded-md bg-neutral-700 px-2 py-0.5">
                  <Text numberOfLines={1} className="text-[10px] text-white">
                    {formatBubble(v[0], v[1])}
                  </Text>
                </View>
              </View>
            </View>

            {/* 트랙 */}
            <View className="py-2" onLayout={onLayout} {...responder.panHandlers}>
              <View className="h-1 rounded-full bg-neutral-200">
                <View
                  style={{ left: loCenter, width: Math.max(0, hiCenter - loCenter) }}
                  className="absolute h-1 rounded-full bg-violet-600"
                />
              </View>
              <Thumb x={loX} />
              <Thumb x={hiX} />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-neutral-400">{minTick}</Text>
              <Text className="text-xs text-neutral-400">{maxTick}</Text>
            </View>
          </View>
        );
      }}
    </RangeSlider>
  );
}

function Thumb({ x }: { x: number }) {
  return (
    <View
      style={{ left: x }}
      className="absolute top-1 h-4 w-4 rounded-full border-2 border-violet-600 bg-white"
    />
  );
}
