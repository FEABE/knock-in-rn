import { useEffect, useRef, useState } from 'react';

import type { BudgetValues } from './budget-filter-sheet';
import type { FilterTabKey, RoomFilterValue } from './room-filter-sheet';

export type UseRoomFilterSheetProps = {
  open: boolean;
  value: RoomFilterValue;
  onChange: (next: RoomFilterValue) => void;
  onOpenChange: (open: boolean) => void;
  defaultTab: FilterTabKey;
  initial?: RoomFilterValue;
};

export function useRoomFilterSheet({
  open,
  value,
  onChange,
  onOpenChange,
  defaultTab,
  initial,
}: UseRoomFilterSheetProps) {
  const [draft, setDraft] = useState<RoomFilterValue>(value);
  const [tab, setTab] = useState<FilterTabKey>(defaultTab);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(value);
      setTab(defaultTab);
    }
    wasOpenRef.current = open;
  }, [defaultTab, open, value]);

  const budget: BudgetValues = {
    depositMin: draft.depositMin,
    depositMax: draft.depositMax,
    rentMin: draft.rentMin,
    rentMax: draft.rentMax,
  };

  return {
    draft,
    tab,
    budget,
    setTab,
    setRegions: (regions: RoomFilterValue['regions']) => setDraft((prev) => ({ ...prev, regions })),
    setGender: (gender: RoomFilterValue['gender']) => setDraft((prev) => ({ ...prev, gender })),
    setBudget: (next: BudgetValues) => setDraft((prev) => ({ ...prev, ...next })),
    setRoomTypes: (roomTypes: RoomFilterValue['roomTypes']) =>
      setDraft((prev) => ({ ...prev, roomTypes })),
    reset: () => {
      if (initial) setDraft(initial);
    },
    apply: () => {
      onChange(draft);
      onOpenChange(false);
    },
  };
}
