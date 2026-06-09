import { useRef, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';

import { RangeSlider } from '@/components/ui/headless';

import { FilterSheet } from './filter-sheet';

export type BudgetValues = {
  depositMin: number;
  depositMax: number;
  rentMin: number;
  rentMax: number;
};

export type BudgetFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: BudgetValues;
  onChange: (next: BudgetValues) => void;
  depositRange?: [number, number];
  rentRange?: [number, number];
};

const DEFAULTS = {
  deposit: [0, 2000] as [number, number],
  rent: [0, 500] as [number, number],
};

export function BudgetFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
  depositRange = DEFAULTS.deposit,
  rentRange = DEFAULTS.rent,
}: BudgetFilterSheetProps) {
  const [deposit, setDeposit] = useState<[number, number]>([value.depositMin, value.depositMax]);
  const [rent, setRent] = useState<[number, number]>([value.rentMin, value.rentMax]);

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="예산"
      onReset={() => {
        setDeposit(depositRange);
        setRent(rentRange);
      }}
      onApply={() =>
        onChange({
          depositMin: deposit[0],
          depositMax: deposit[1],
          rentMin: rent[0],
          rentMax: rent[1],
        })
      }
    >
      <RangeRow
        label="보증금"
        min={depositRange[0]}
        max={depositRange[1]}
        step={50}
        value={deposit}
        onChange={setDeposit}
        rangeLabel={
          deposit[0] === depositRange[0] && deposit[1] === depositRange[1]
            ? '전체 범위'
            : `${deposit[0]}~${deposit[1]}만`
        }
      />
      <RangeRow
        label="월세"
        min={rentRange[0]}
        max={rentRange[1]}
        step={5}
        value={rent}
        onChange={setRent}
        rangeLabel={
          rent[0] === rentRange[0] && rent[1] === rentRange[1]
            ? '전체 범위'
            : `${rent[0]}~${rent[1]}만`
        }
      />
    </FilterSheet>
  );
}

function RangeRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
  rangeLabel,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  rangeLabel: string;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-800">{label}</Text>
        <Text className="text-xs text-violet-700">{rangeLabel}</Text>
      </View>

      <RangeSlider
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]])}
        min={min}
        max={max}
        step={step}
        minDistance={step}
      >
        {({ percents, setStart, setEnd, min: rmin, max: rmax }) => (
          <SliderTrack
            startPct={percents[0]}
            endPct={percents[1]}
            onStartDelta={(deltaPct) => {
              setStart(value[0] + (deltaPct / 100) * (rmax - rmin));
            }}
            onEndDelta={(deltaPct) => {
              setEnd(value[1] + (deltaPct / 100) * (rmax - rmin));
            }}
          />
        )}
      </RangeSlider>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-neutral-400">{min === 0 ? '0' : min.toLocaleString()}</Text>
        <Text className="text-xs text-neutral-400">{max.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function SliderTrack({
  startPct,
  endPct,
  onStartDelta,
  onEndDelta,
}: {
  startPct: number;
  endPct: number;
  onStartDelta: (deltaPct: number) => void;
  onEndDelta: (deltaPct: number) => void;
}) {
  const widthRef = useRef(280);

  const startResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const deltaPct = (g.dx / widthRef.current) * 100;
        onStartDelta(deltaPct);
      },
    }),
  ).current;

  const endResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const deltaPct = (g.dx / widthRef.current) * 100;
        onEndDelta(deltaPct);
      },
    }),
  ).current;

  return (
    <View
      className="relative h-6 justify-center"
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
    >
      <View className="h-1 rounded-full bg-neutral-200" />
      <View
        className="absolute h-1 rounded-full bg-violet-600"
        style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
      />
      <View
        {...startResponder.panHandlers}
        className="absolute h-5 w-5 -translate-x-2.5 rounded-full border-2 border-violet-600 bg-white shadow"
        style={{ left: `${startPct}%` }}
      />
      <View
        {...endResponder.panHandlers}
        className="absolute h-5 w-5 -translate-x-2.5 rounded-full border-2 border-violet-600 bg-white shadow"
        style={{ left: `${endPct}%` }}
      />
    </View>
  );
}
