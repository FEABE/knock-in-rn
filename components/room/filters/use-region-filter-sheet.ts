import { useEffect, useRef, useState } from 'react';

import type { Region } from '@/lib/onboarding';

export type UseRegionFilterSheetProps = {
  open: boolean;
  value: Region[];
  onChange: (next: Region[]) => void;
};

export function useRegionFilterSheet({ open, value, onChange }: UseRegionFilterSheetProps) {
  const [draft, setDraft] = useState<Region[]>(value);
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
    reset: () => setDraft([]),
    apply: () => onChange(draft),
  };
}
