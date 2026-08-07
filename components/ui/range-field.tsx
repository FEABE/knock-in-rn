import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  Text,
  View,
} from 'react-native';

import { RangeSlider, type RangeValue, type UseRangeSliderReturn } from '@/components/ui/headless';

const THUMB_SIZE = 26;
const TRACK_HEIGHT = 4;
const TRACK_TOP = (THUMB_SIZE - TRACK_HEIGHT) / 2;

export type RangeFieldProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  minDistance?: number;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  tickLabels: readonly [string, string, string, string];
  scaleStops?: readonly [number, number, number, number];
  allLabel?: string;
  formatValue?: (min: number, max: number) => string;
};

export function RangeField({
  label,
  min,
  max,
  step = 1,
  minDistance = 0,
  value,
  onChange,
  tickLabels,
  scaleStops,
  allLabel = '전체',
  formatValue = formatBudgetRange,
}: RangeFieldProps) {
  return (
    <RangeSlider
      value={value}
      min={min}
      max={max}
      step={step}
      minDistance={minDistance}
      onValueChange={onChange}
      accessibilityLabel={label}
    >
      {(slider) => (
        <RangeFieldControl
          label={label}
          tickLabels={tickLabels}
          allLabel={allLabel}
          formatValue={formatValue}
          scaleStops={scaleStops}
          slider={slider}
        />
      )}
    </RangeSlider>
  );
}

function RangeFieldControl({
  label,
  tickLabels,
  allLabel,
  formatValue,
  scaleStops,
  slider,
}: {
  label: string;
  tickLabels: RangeFieldProps['tickLabels'];
  allLabel: string;
  formatValue: NonNullable<RangeFieldProps['formatValue']>;
  scaleStops: RangeFieldProps['scaleStops'];
  slider: UseRangeSliderReturn;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<View>(null);
  const trackLeft = useRef(0);
  const activeThumb = useRef<0 | 1 | null>(0);
  const { value, percents, setStart, setEnd, min, max } = slider;

  const measureTrack = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    trackRef.current?.measureInWindow((x) => {
      trackLeft.current = x;
    });
  };

  const valueAt = useCallback(
    (pageX: number) => {
      const usableWidth = Math.max(1, trackWidth - THUMB_SIZE);
      const localCenter = pageX - trackLeft.current;
      const ratio = Math.max(0, Math.min(1, (localCenter - THUMB_SIZE / 2) / usableWidth));
      return ratioToValue(ratio, scaleStops, min, max);
    },
    [max, min, scaleStops, trackWidth],
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const next = valueAt(event.nativeEvent.pageX);
          const nextRatio = valueToRatio(next, scaleStops, min, max);
          const startRatio = valueToRatio(value[0], scaleStops, min, max);
          const endRatio = valueToRatio(value[1], scaleStops, min, max);

          if (startRatio === endRatio) {
            // 두 손잡이가 겹친 경우 같은 위치의 터치만으로는 방향을 알 수 없다.
            // 다음 move에서 왼쪽은 시작, 오른쪽은 끝 손잡이로 분리한다.
            activeThumb.current = nextRatio < startRatio ? 0 : nextRatio > endRatio ? 1 : null;
          } else {
            activeThumb.current =
              Math.abs(nextRatio - startRatio) <= Math.abs(nextRatio - endRatio) ? 0 : 1;
          }

          if (activeThumb.current === 0) setStart(next);
          if (activeThumb.current === 1) setEnd(next);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          const next = valueAt(event.nativeEvent.pageX);
          if (activeThumb.current === null) {
            activeThumb.current = next < value[0] ? 0 : 1;
          }
          if (activeThumb.current === 0) setStart(next);
          if (activeThumb.current === 1) setEnd(next);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [max, min, scaleStops, setEnd, setStart, value, valueAt],
  );

  const usableWidth = Math.max(0, trackWidth - THUMB_SIZE);
  const startX =
    (scaleStops ? valueToRatio(value[0], scaleStops, min, max) : percents[0] / 100) * usableWidth;
  const endX =
    (scaleStops ? valueToRatio(value[1], scaleStops, min, max) : percents[1] / 100) * usableWidth;
  const isAll = value[0] === min && value[1] === max;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between pr-2">
        <Text className="text-[15px] font-medium leading-[23px] text-[#17171B]">{label}</Text>
        <Text className="text-[15px] font-medium leading-[23px] text-[#256EF4]">
          {isAll ? allLabel : formatValue(value[0], value[1])}
        </Text>
      </View>

      <View className="px-2">
        <View
          ref={trackRef}
          className="relative h-[26px]"
          onLayout={measureTrack}
          {...responder.panHandlers}
        >
          <View
            className="absolute rounded-full bg-[#ECECF3]"
            style={{ left: 1, right: 1, top: TRACK_TOP, height: TRACK_HEIGHT }}
          />
          <View
            className="absolute rounded-full bg-[#4C87F6]"
            style={{
              left: startX + 1,
              top: TRACK_TOP,
              width: Math.max(0, endX - startX + THUMB_SIZE - 2),
              height: TRACK_HEIGHT,
            }}
          />
          <Thumb x={startX} />
          <Thumb x={endX} />
        </View>

        <RangeTicks labels={tickLabels} />
      </View>
    </View>
  );
}

function Thumb({ x }: { x: number }) {
  return (
    <View
      pointerEvents="none"
      className="absolute h-[26px] w-[26px] rounded-full border border-[#DADAE8] bg-white"
      style={{
        left: x,
        shadowColor: '#696976',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      }}
    />
  );
}

function RangeTicks({ labels }: { labels: RangeFieldProps['tickLabels'] }) {
  return (
    <View className="relative mt-0.5 h-[26px]">
      {labels.map((label, index) => {
        const placement =
          index === 0
            ? { left: 0, alignItems: 'flex-start' as const }
            : index === labels.length - 1
              ? { right: 0, alignItems: 'flex-end' as const }
              : {
                  left: `${(index / (labels.length - 1)) * 100}%` as const,
                  marginLeft: -32,
                  width: 64,
                  alignItems: 'center' as const,
                };

        return (
          <View key={`${label}-${index}`} className="absolute gap-0.5" style={placement}>
            <View className="h-2 w-px bg-[#DADAE8]" />
            <Text className="text-xs leading-[18px] text-[#696976]">{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function formatBudgetRange(min: number, max: number): string {
  if (min === max) return min === 0 ? '0원' : `${min.toLocaleString()}만원`;
  const minLabel = min === 0 ? '0원' : min.toLocaleString();
  return `${minLabel}~${max.toLocaleString()}만원`;
}

function ratioToValue(
  ratio: number,
  stops: RangeFieldProps['scaleStops'],
  min: number,
  max: number,
): number {
  if (!isValidScale(stops, min, max)) return min + ratio * (max - min);

  const segment = Math.min(stops.length - 2, Math.floor(ratio * (stops.length - 1)));
  const segmentRatio = ratio * (stops.length - 1) - segment;
  return stops[segment] + segmentRatio * (stops[segment + 1] - stops[segment]);
}

function valueToRatio(
  value: number,
  stops: RangeFieldProps['scaleStops'],
  min: number,
  max: number,
): number {
  if (!isValidScale(stops, min, max)) return (value - min) / Math.max(1, max - min);

  const clamped = Math.max(min, Math.min(max, value));
  const segment = Math.min(
    stops.length - 2,
    Math.max(0, stops.findIndex((stop, index) => index > 0 && clamped <= stop) - 1),
  );
  const segmentWidth = stops[segment + 1] - stops[segment];
  const segmentRatio = (clamped - stops[segment]) / segmentWidth;
  return (segment + segmentRatio) / (stops.length - 1);
}

function isValidScale(
  stops: RangeFieldProps['scaleStops'],
  min: number,
  max: number,
): stops is readonly [number, number, number, number] {
  return (
    stops !== undefined &&
    stops[0] === min &&
    stops[stops.length - 1] === max &&
    stops.every((stop, index) => index === 0 || stop > stops[index - 1])
  );
}
