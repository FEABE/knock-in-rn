import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { roomFormValuesToBoardWriteRequest } from '@/components/room/room-post-form.api';
import type { RoomFormDraft, RoomFormValues } from '@/components/room/room-post-form';
import {
  compactNumbers,
  parseServerDate,
  regionFromBackendId,
  roomTypeBackendId,
  serverCalendarDateToLocal,
  ROOM_TYPE_BACKEND_LABELS,
  type BoardEditData,
  type BoardWriteRequest,
  useMyLifestyleOverview,
  useRoommateBoardDetail,
  useRoommateBoardEdit,
  useRoommateBoardWriteActions,
  type LifestyleSummaryItem,
  type PreferencePrioritySummaryItem,
} from '@/lib/api';
import { useSession, type RoomPost } from '@/lib/domain';

export type EditRoomState = 'loading' | 'missing' | 'forbidden' | 'editable';

export type UseEditRoomScreenReturn = {
  state: EditRoomState;
  post?: RoomPost;
  profile?: RoomPost['author'];
  lifestyleTiles: LifestyleSummaryItem[];
  preferredLifestyles: LifestyleSummaryItem[];
  importantConditions: PreferencePrioritySummaryItem[];
  profileMetadataChanged: boolean;
  initial?: Partial<RoomFormDraft>;
  submitting: boolean;
  toastMessage: string | null;
  onBack: () => void;
  onSubmit: (values: RoomFormValues) => Promise<void>;
};

const SUCCESS_TOAST_MS = 1200;

export function useEditRoomScreen(): UseEditRoomScreenReturn {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const boardId = typeof id === 'string' ? id : '';
  const { session } = useSession();
  // 세션에는 생활패턴/선호조건이 없어서 화면 진입 시 서버에서 직접 읽어온다.
  const lifestyleOverview = useMyLifestyleOverview(Boolean(session));
  const { data: post, loading, error } = useRoommateBoardDetail(boardId);
  const { data: editData, loading: editLoading } = useRoommateBoardEdit(boardId);
  const { updateBoard } = useRoommateBoardWriteActions();
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  // 성공 토스트를 잠시 보여준 뒤 이전 화면으로 복귀한다.
  const showToastAndGoBack = (message: string) => {
    setToastMessage(message);
    backTimer.current = setTimeout(() => router.back(), SUCCESS_TOAST_MS);
  };

  const state: EditRoomState =
    loading || editLoading
      ? 'loading'
      : !post || error
        ? 'missing'
        : session?.user.id !== post.author.id && session?.user.name !== post.author.name
          ? 'forbidden'
          : 'editable';

  const onSubmit = async (values: RoomFormValues) => {
    if (!post || submitting) return;
    const body = roomFormValuesToBoardWriteRequest(values);
    applyEditMetadata(body, values, editData ?? undefined);
    setSubmitting(true);
    try {
      await updateBoard(post.id, body);
    } catch (updateError) {
      Alert.alert(
        '수정 실패',
        updateError instanceof Error ? updateError.message : '잠시 후 다시 시도해주세요.',
      );
      setSubmitting(false);
      return;
    }
    showToastAndGoBack('게시글이 수정되었어요');
  };

  return {
    state,
    post: post ?? undefined,
    profile: session?.user,
    lifestyleTiles: lifestyleOverview.data?.lifestyles ?? [],
    preferredLifestyles: lifestyleOverview.data?.preferredLifestyles ?? [],
    importantConditions: lifestyleOverview.data?.importantConditions ?? [],
    profileMetadataChanged:
      !!editData &&
      !!lifestyleOverview.data &&
      hasProfileMetadataChanged(editData, lifestyleOverview.data),
    initial: editData ? toInitialDraftFromEdit(editData) : post ? toInitialDraft(post) : undefined,
    submitting,
    toastMessage,
    onBack: () => router.back(),
    onSubmit,
  };
}

function toInitialDraftFromEdit(edit: BoardEditData): Partial<RoomFormDraft> {
  return {
    title: edit.title,
    deposit: String(edit.deposit),
    rent: String(edit.monthlyRent),
    maintenance: String(edit.managementCost),
    roomType: roomTypeValueFromEdit(edit),
    regions: [regionFromBackendId(edit.region?.regionId ?? edit.region?.fullName)],
    description: edit.contents,
    moveInDate: fmtCalendarDate(parseServerDate(edit.comeableDate)),
    negotiable: edit.comeableDateNegotiable ?? null,
    imageUris: edit.images?.map((image) => image.url).filter((url): url is string => !!url) ?? [],
    options:
      edit.roomExtraOptions
        ?.map((option) => option.extraOptionId)
        .filter((option): option is number => Number.isFinite(option)) ?? [],
  };
}

function roomTypeValueFromEdit(edit: BoardEditData): string | null {
  const roomTypeId = Number(edit.roomType?.roomTypeId);
  if (Number.isFinite(roomTypeId)) return String(roomTypeId);

  const name = edit.roomType?.name?.trim();
  const matched = Object.entries(ROOM_TYPE_BACKEND_LABELS).find(([, label]) => label === name);
  return matched?.[0] ?? null;
}

function hasProfileMetadataChanged(
  edit: BoardEditData,
  current: {
    lifestyles: LifestyleSummaryItem[];
    preferredLifestyles: LifestyleSummaryItem[];
    importantConditions: PreferencePrioritySummaryItem[];
  },
): boolean {
  return (
    !summaryValuesEqual(edit.lifeStyles, current.lifestyles) ||
    !summaryValuesEqual(edit.conditions, current.preferredLifestyles) ||
    !priorityValuesEqual(edit.conditionWeights, current.importantConditions)
  );
}

function summaryValuesEqual(
  saved:
    | {
        name?: string;
        value?: string;
        description?: string;
      }[]
    | undefined,
  current: LifestyleSummaryItem[],
): boolean {
  const savedValues = (saved ?? []).flatMap((item) => {
    const label = item.name?.trim();
    const value = item.description?.trim() || item.value?.trim();
    return label && value ? [`${label}\u0000${value}`] : [];
  });
  const currentValues = current.flatMap((item) => {
    const label = item.label.trim();
    const value = item.value.trim();
    return label && value && value !== '미입력' ? [`${label}\u0000${value}`] : [];
  });
  return sortedValues(savedValues).join('\u0001') === sortedValues(currentValues).join('\u0001');
}

function priorityValuesEqual(
  saved: { name?: string }[] | undefined,
  current: PreferencePrioritySummaryItem[],
): boolean {
  const savedValues = (saved ?? []).map((item) => item.name?.trim()).filter(Boolean) as string[];
  const currentValues = current.map((item) => item.name.trim()).filter(Boolean);
  return sortedValues(savedValues).join('\u0001') === sortedValues(currentValues).join('\u0001');
}

function sortedValues(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right, 'ko'));
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
  const roomTypeId = roomTypeBackendId(post.roomType);
  return {
    title: post.title,
    deposit: String(post.deposit),
    rent: String(post.monthlyRent),
    maintenance: post.maintenanceFee !== undefined ? String(post.maintenanceFee) : '',
    roomType: roomTypeId !== undefined ? String(roomTypeId) : post.roomType,
    regions: [post.region],
    description: post.description,
    moveInDate: fmtCalendarDate(post.moveInDate),
    negotiable: post.moveInNegotiable ?? null,
    imageUris: post.photoUrls ?? (post.thumbnailUrl ? [post.thumbnailUrl] : []),
    options: compactNumbers(post.options?.map((option) => option.id) ?? []),
  };
}

/**
 * 서버 comeableDate는 UTC 자정으로 저장된 '캘린더 날짜'다.
 * 로컬 자정으로 옮긴 뒤 draft의 YYYY-MM-DD로 직렬화해야 기기 시간대와 무관하게 같은 날짜가 채워진다.
 */
function fmtCalendarDate(date: Date | null | undefined): string {
  if (!date) return '';
  const local = serverCalendarDateToLocal(date);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(
    local.getDate(),
  ).padStart(2, '0')}`;
}
