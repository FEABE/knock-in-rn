import { View } from 'react-native';

import { RangeField } from '@/components/ui/range-field';
import { FilterSheet } from './filter-sheet';
import { useBudgetFilterSheet } from './use-budget-filter-sheet';

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

export function BudgetFilterBody({
  value,
  onChange,
  depositRange = DEFAULTS.deposit,
  rentRange = DEFAULTS.rent,
}: {
  value: BudgetValues;
  onChange: (next: BudgetValues) => void;
  depositRange?: [number, number];
  rentRange?: [number, number];
}) {
  const deposit: [number, number] = [value.depositMin, value.depositMax];
  const rent: [number, number] = [value.rentMin, value.rentMax];
  const depositScale = makeScaleStops(depositRange, 400, 1200);
  const rentScale = makeScaleStops(rentRange, 125, 250);

  return (
    <View className="gap-9">
      <RangeField
        label="보증금"
        min={depositRange[0]}
        max={depositRange[1]}
        step={50}
        minDistance={50}
        value={deposit}
        onChange={([min, max]) => onChange({ ...value, depositMin: min, depositMax: max })}
        tickLabels={makeTickLabels(depositScale)}
        scaleStops={depositScale}
      />
      <RangeField
        label="월세"
        min={rentRange[0]}
        max={rentRange[1]}
        step={5}
        minDistance={5}
        value={rent}
        onChange={([min, max]) => onChange({ ...value, rentMin: min, rentMax: max })}
        tickLabels={makeTickLabels(rentScale)}
        scaleStops={rentScale}
      />
    </View>
  );
}

export function BudgetFilterSheet({
  open,
  onOpenChange,
  value,
  onChange,
  depositRange = DEFAULTS.deposit,
  rentRange = DEFAULTS.rent,
}: BudgetFilterSheetProps) {
  const { draft, setDraft, reset, apply } = useBudgetFilterSheet({
    open,
    value,
    onChange,
    depositRange,
    rentRange,
  });

  return (
    <FilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="예산"
      onReset={reset}
      onApply={apply}
    >
      <BudgetFilterBody
        value={draft}
        onChange={setDraft}
        depositRange={depositRange}
        rentRange={rentRange}
      />
    </FilterSheet>
  );
}

function makeScaleStops(
  [min, max]: [number, number],
  first: number,
  second: number,
): [number, number, number, number] {
  if (min < first && first < second && second < max) return [min, first, second, max];
  const interval = (max - min) / 3;
  return [min, min + interval, min + interval * 2, max];
}

function makeTickLabels(
  stops: readonly [number, number, number, number],
): [string, string, string, string] {
  return ['최소', `${stops[1].toLocaleString()}만`, `${stops[2].toLocaleString()}만`, '최대'];
}
