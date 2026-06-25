import { useEffect, useRef, useState } from 'react';

import type { BudgetValues } from './budget-filter-sheet';

export type UseBudgetFilterSheetProps = {
  open: boolean;
  value: BudgetValues;
  onChange: (next: BudgetValues) => void;
  depositRange: [number, number];
  rentRange: [number, number];
};

export function useBudgetFilterSheet({
  open,
  value,
  onChange,
  depositRange,
  rentRange,
}: UseBudgetFilterSheetProps) {
  const [draft, setDraft] = useState<BudgetValues>(value);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(value);
    }
    wasOpenRef.current = open;
  }, [open, value]);

  return {
    draft,
    setDraft,
    reset: () =>
      setDraft({
        depositMin: depositRange[0],
        depositMax: depositRange[1],
        rentMin: rentRange[0],
        rentMax: rentRange[1],
      }),
    apply: () => onChange(draft),
  };
}
