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
  submitting?: boolean;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
  mode = 'create',
  profile,
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
      submitting={submitting}
      onEditProfile={() => goMypageProfile(router)}
    />
  );
}

export * from './room-post-form.model';
