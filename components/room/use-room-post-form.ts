import { useState } from 'react';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import type { RoomOption } from '@/lib/domain';
import type { Region, RoomType } from '@/lib/onboarding';

import {
  draftToValues,
  emptyRoomFormDraft,
  isRoomFormDraftValid,
  type RoomFormDraft,
  type RoomFormValues,
} from './room-post-form.model';

export type UseRoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
};

export type UseRoomPostFormReturn = {
  draft: RoomFormDraft;
  canSubmit: boolean;
  photoCount: number;
  bottomPadding: number;
  setTitle: (next: string) => void;
  setDeposit: (next: string) => void;
  setRent: (next: string) => void;
  setMaintenance: (next: string) => void;
  selectRoomType: (next: RoomType) => void;
  selectRegion: (next: Region) => void;
  setMoveInDate: (next: string) => void;
  setImageUrlsText: (next: string) => void;
  toggleOption: (next: RoomOption) => void;
  setDescription: (next: string) => void;
  toggleProfileInfo: () => void;
  submit: () => void;
};

export function useRoomPostForm({
  initial,
  onSubmit,
}: UseRoomPostFormProps): UseRoomPostFormReturn {
  const [draft, setDraft] = useState<RoomFormDraft>({
    ...emptyRoomFormDraft(),
    ...initial,
  });

  const patch = (next: Partial<RoomFormDraft>) => setDraft((prev) => ({ ...prev, ...next }));
  const canSubmit = isRoomFormDraftValid(draft);
  const bottomPadding = useSafeBottomPadding(12, 12);

  return {
    draft,
    canSubmit,
    photoCount: countImageUrls(draft.imageUrlsText),
    bottomPadding,
    setTitle: (next) => patch({ title: next }),
    setDeposit: (next) => patch({ deposit: next }),
    setRent: (next) => patch({ rent: next }),
    setMaintenance: (next) => patch({ maintenance: next }),
    selectRoomType: (next) => patch({ roomType: next }),
    selectRegion: (next) => patch({ regions: [next] }),
    setMoveInDate: (next) => patch({ moveInDate: next }),
    setImageUrlsText: (next) => patch({ imageUrlsText: next }),
    toggleOption: (next) => {
      patch({
        options: draft.options.includes(next)
          ? draft.options.filter((option) => option !== next)
          : [...draft.options, next],
      });
    },
    setDescription: (next) => patch({ description: next }),
    toggleProfileInfo: () => patch({ showProfileInfo: !draft.showProfileInfo }),
    submit: () => {
      const values = draftToValues(draft);
      if (values) onSubmit(values);
    },
  };
}

function countImageUrls(text: string): number {
  return text
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//.test(url))
    .slice(0, 10).length;
}
