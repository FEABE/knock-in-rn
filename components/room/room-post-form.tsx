import { useRouter } from 'expo-router';

import type { UserSummary } from '@/lib/domain';
import { goMypageProfile } from '@/lib/navigation/routes';

import { RoomPostFormView } from './room-post-form.view';
import type { RoomFormDraft, RoomFormValues } from './room-post-form.model';
import { useRoomPostForm } from './use-room-post-form';

export type RoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  profile?: UserSummary;
  lifestyleTiles?: { id: string; label: string; value: string }[];
  preferredLifestyles?: { label: string; value: string }[];
  importantConditions?: string[];
  submitting?: boolean;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
  mode = 'create',
  profile,
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
      profile={profile}
      lifestyleTiles={lifestyleTiles}
      preferredLifestyles={preferredLifestyles}
      importantConditions={importantConditions}
      submitting={submitting}
      onEditProfile={() => goMypageProfile(router)}
    />
  );
}

export * from './room-post-form.model';
