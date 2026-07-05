import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { roomFormValuesToBoardWriteRequest } from '@/components/room/room-post-form.api';
import type { RoomFormDraft, RoomFormValues } from '@/components/room/room-post-form';
import {
  compactNumbers,
  regionFromBackendId,
  roomOptionBackendId,
  roomTypeFromBackendId,
  type BoardEditData,
  type BoardWriteRequest,
  useRoommateBoardDetail,
  useRoommateBoardEdit,
  useRoommateBoardWriteActions,
} from '@/lib/api';
import { useSession, type RoomPost } from '@/lib/domain';

export type EditRoomState = 'loading' | 'missing' | 'forbidden' | 'editable';

export type UseEditRoomScreenReturn = {
  state: EditRoomState;
  post?: RoomPost;
  profile?: RoomPost['author'];
  initial?: Partial<RoomFormDraft>;
  onBack: () => void;
  onDelete: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
};

export function useEditRoomScreen(): UseEditRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const boardId = typeof id === 'string' ? id : '';
  const { session } = useSession();
  const { data: post, loading, error } = useRoommateBoardDetail(boardId);
  const { data: editData, loading: editLoading } = useRoommateBoardEdit(boardId);
  const { updateBoard, deleteBoard } = useRoommateBoardWriteActions();

  const state: EditRoomState = loading || editLoading
    ? 'loading'
    : !post || error
      ? 'missing'
      : session?.user.id !== post.author.id && session?.user.name !== post.author.name
        ? 'forbidden'
        : 'editable';

  const onDelete = () => {
    Alert.alert('삭제', '게시글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (!post) return;
          try {
            await deleteBoard(post.id);
          } catch (deleteError) {
            Alert.alert(
              '삭제 실패',
              deleteError instanceof Error ? deleteError.message : '잠시 후 다시 시도해주세요.',
            );
            return;
          }
          router.back();
        },
      },
    ]);
  };

  const onSubmit = async (values: RoomFormValues) => {
    if (!post) return;
    const body = roomFormValuesToBoardWriteRequest(values);
    applyEditMetadata(body, values, editData ?? undefined);
    try {
      await updateBoard(post.id, body);
    } catch (updateError) {
      Alert.alert(
        '수정 실패',
        updateError instanceof Error ? updateError.message : '잠시 후 다시 시도해주세요.',
      );
      return;
    }
    Alert.alert('수정 완료', '게시글이 수정되었어요.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return {
    state,
    post: post ?? undefined,
    profile: session?.user,
    initial: editData ? toInitialDraftFromEdit(editData) : post ? toInitialDraft(post) : undefined,
    onBack: () => router.back(),
    onDelete,
    onSubmit,
  };
}

function toInitialDraftFromEdit(edit: BoardEditData): Partial<RoomFormDraft> {
  return {
    title: edit.title,
    deposit: String(edit.deposit),
    rent: String(edit.monthlyRent),
    maintenance: String(edit.managementCost),
    roomType: roomTypeFromBackendId(edit.roomType?.roomTypeId),
    regions: [regionFromBackendId(edit.region?.regionId ?? edit.region?.fullName)],
    description: edit.contents,
    moveInDate: edit.comeableDate ? fmtDate(new Date(edit.comeableDate)) : '',
    imageUrlsText: edit.images?.map((image) => image.url).filter(Boolean).join('\n') ?? '',
    options:
      edit.roomExtraOptions
        ?.map((option) => option.extraOptionId)
        .filter((option): option is number => Number.isFinite(option)) ?? [],
    showProfileInfo: true,
  };
}

function applyEditMetadata(
  body: BoardWriteRequest,
  values: RoomFormValues,
  edit: BoardEditData | undefined,
) {
  if (!edit) return;

  const selectedOptionIds = compactNumbers(values.options);
  const previousOptionIds = compactNumbers(
    edit.roomExtraOptions?.map((option) => option.extraOptionId) ?? [],
  );
  body.deleteExtraOptionIds = previousOptionIds.filter((id) => !selectedOptionIds.includes(id));
  body.newExtraOptionIds = selectedOptionIds.filter((id) => !previousOptionIds.includes(id));

  const imageUrlSet = new Set(values.imageUrls);
  body.existingImages =
    edit.images
      ?.filter(
        (image): image is { boardFileId: number; url?: string } =>
          image.boardFileId !== undefined && !!image.url && imageUrlSet.has(image.url),
      )
      .map((image, index) => ({
        boardFileId: image.boardFileId,
        thumbnail: index === 0,
      })) ?? [];
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
    imageUrlsText: (post.photoUrls ?? (post.thumbnailUrl ? [post.thumbnailUrl] : [])).join('\n'),
    options: compactNumbers(post.options?.map(roomOptionBackendId) ?? []),
    showProfileInfo: true,
  };
}

function fmtDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
