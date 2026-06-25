import type { UserSummary } from '@/lib/domain';

import { RoomPostFormView } from './room-post-form.view';
import type { RoomFormDraft, RoomFormValues } from './room-post-form.model';
import { useRoomPostForm } from './use-room-post-form';

export type RoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  submitLabel: string;
  mode?: 'create' | 'edit';
  profile?: UserSummary;
};

export function RoomPostForm({
  initial,
  onSubmit,
  submitLabel,
  mode = 'create',
  profile,
}: RoomPostFormProps) {
  const asks = useRoomPostForm({ initial, onSubmit });

  return <RoomPostFormView {...asks} submitLabel={submitLabel} mode={mode} profile={profile} />;
}

export * from './room-post-form.model';
