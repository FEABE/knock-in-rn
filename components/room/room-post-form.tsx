import { useRouter } from 'expo-router';

import type { LifestyleSummaryItem, PreferencePrioritySummaryItem } from '@/lib/api';
import { goMypageProfile } from '@/lib/navigation/routes';

import { RoomPostFormView } from './room-post-form.view';
import type { RoomFormDraft, RoomFormValues } from './room-post-form.model';
import { useRoomPostForm } from './use-room-post-form';

export type RoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  lifestyleTiles?: LifestyleSummaryItem[];
  preferredLifestyles?: LifestyleSummaryItem[];
  importantConditions?: PreferencePrioritySummaryItem[];
  submitting?: boolean;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
  mode = 'create',
  lifestyleTiles,
  preferredLifestyles,
  importantConditions,
  submitting = false,
}: RoomPostFormProps) {
  const router = useRouter();
  const asks = useRoomPostForm({ initial, onSubmit, mode });

  return (
    <RoomPostFormView
      {...asks}
      submitLabel={submitLabel}
      mode={mode}
      lifestyleTiles={lifestyleTiles}
      preferredLifestyles={preferredLifestyles}
      importantConditions={importantConditions}
      submitting={submitting}
      onEditProfile={() => goMypageProfile(router)}
    />
  );
}

export * from './room-post-form.model';
