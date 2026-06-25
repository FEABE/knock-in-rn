import { useEffect, useRef, useState } from 'react';

import type { GenderFilterValue } from './gender-filter-sheet';

export type UseGenderFilterSheetProps = {
  open: boolean;
  value: GenderFilterValue;
  onChange: (next: GenderFilterValue) => void;
};

export function useGenderFilterSheet({ open, value, onChange }: UseGenderFilterSheetProps) {
  const [draft, setDraft] = useState<GenderFilterValue>(value);
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
    reset: () => setDraft('any'),
    apply: () => onChange(draft),
  };
}
