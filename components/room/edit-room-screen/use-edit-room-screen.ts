import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo } from 'react';

import type { RoomFormDraft, RoomFormValues } from '@/components/room/room-post-form';
import { useRoomStore, useSession, type RoomPost } from '@/lib/domain';

export type EditRoomState = 'missing' | 'forbidden' | 'editable';

export type UseEditRoomScreenReturn = {
  state: EditRoomState;
  post?: RoomPost;
  profile?: RoomPost['author'];
  initial?: Partial<RoomFormDraft>;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: RoomFormValues) => void;
};

export function useEditRoomScreen(): UseEditRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { getById, update } = useRoomStore();

  const post = useMemo(() => (typeof id === 'string' ? getById(id) : undefined), [id, getById]);

  const state: EditRoomState = !post
    ? 'missing'
    : session?.user.id !== post.author.id
      ? 'forbidden'
      : 'editable';

  const onDelete = () => {
    Alert.alert('삭제', '게시글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const onSubmit = (values: RoomFormValues) => {
    if (!post) return;
    update(post.id, {
      title: values.title,
      deposit: values.deposit,
      monthlyRent: values.monthlyRent,
      maintenanceFee: values.maintenanceFee,
      roomType: values.roomType,
      region: values.region,
      description: values.description,
      moveInDate: values.moveInDate,
      options: values.options,
    });
    Alert.alert('수정 완료', '게시글이 수정되었어요.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return {
    state,
    post,
    profile: session?.user,
    initial: post ? toInitialDraft(post) : undefined,
    onBack: () => router.back(),
    onDelete,
    onSubmit,
  };
}

function toInitialDraft(post: RoomPost): Partial<RoomFormDraft> {
  return {
    title: post.title,
    deposit: String(post.deposit),
    rent: String(post.monthlyRent),
    maintenance: post.maintenanceFee !== undefined ? String(post.maintenanceFee) : '',
    roomType: post.roomType,
    regions: [post.region],
    description: post.description,
    moveInDate: post.moveInDate ? fmtDate(post.moveInDate) : '',
    options: post.options ?? [],
    showProfileInfo: true,
  };
}

function fmtDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
