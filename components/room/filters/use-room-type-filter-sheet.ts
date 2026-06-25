import { useEffect, useRef, useState } from 'react';

import type { RoomType } from '@/lib/onboarding';

export type UseRoomTypeFilterSheetProps = {
  open: boolean;
  value: RoomType[];
  onChange: (next: RoomType[]) => void;
};

export function useRoomTypeFilterSheet({ open, value, onChange }: UseRoomTypeFilterSheetProps) {
  const [draft, setDraft] = useState<RoomType[]>(value);
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
