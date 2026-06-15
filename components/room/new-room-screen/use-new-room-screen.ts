import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import type { RoomFormValues } from '@/components/room/room-post-form';
import { createRoommateBoard } from '@/lib/api';
import { useRoomStore, useSession } from '@/lib/domain';

export type UseNewRoomScreenReturn = {
  session: ReturnType<typeof useSession>['session'];
  onBack: () => void;
  onSignIn: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
};

export function useNewRoomScreen(): UseNewRoomScreenReturn {
  const router = useRouter();
  const { session, signIn } = useSession();
  const { add } = useRoomStore();

  const onSubmit = async (values: RoomFormValues) => {
    if (!session) return;

    const now = Date.now();
    const thumbnailUrl = `https://picsum.photos/seed/${now}/600/400`;
    const res = await createRoommateBoard({
      title: values.title,
      contents: values.description,
      deposit: String(values.deposit),
      mountlyRent: String(values.monthlyRent),
      managementCost: String(values.maintenanceFee ?? 0),
      roomType: values.roomType,
      region: values.region.id,
      comeableAt: values.moveInDate ? values.moveInDate.toISOString() : '',
      images: [{ image: thumbnailUrl, thumnail: true }],
    });

    if (res.error || res.status !== 200) {
      Alert.alert('등록 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
      return;
    }

    add({
      id: `p-${now}`,
      title: values.title,
      deposit: values.deposit,
      monthlyRent: values.monthlyRent,
      maintenanceFee: values.maintenanceFee,
      roomType: values.roomType,
      region: values.region,
      views: 0,
      likes: 0,
      createdAt: new Date(),
      moveInDate: values.moveInDate,
      status: 'open',
      author: session.user,
      description: values.description,
      options: values.options,
      thumbnailUrl,
    });

    Alert.alert('등록 완료', '게시글이 등록되었어요.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return {
    session,
    onBack: () => router.back(),
    onSignIn: signIn,
    onSubmit,
  };
}
