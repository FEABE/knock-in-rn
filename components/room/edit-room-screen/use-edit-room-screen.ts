import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler } from 'react-native';

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
  /** 뒤로가기로 화면을 벗어나기 전 띄우는 확인창(수정 내용은 저장되지 않는다). */
  exitDialogOpen: boolean;
  onBack: () => void;
  onExitCancel: () => void;
  onExitConfirm: () => void;
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
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 수정 성공 후 자동 복귀는 확인창 없이 지나가야 한다. */
  const leavingRef = useRef(false);

  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  // 성공 토스트를 잠시 보여준 뒤 이전 화면으로 복귀한다.
  const showToastAndGoBack = (message: string) => {
    setToastMessage(message);
    leavingRef.current = true;
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

  // Android 하드웨어 뒤로가기도 헤더 뒤로가기와 같은 확인창을 거치게 한다.
  // (iOS 스와이프 뒤로가기는 app/room/[id]/edit.tsx 에서 gestureEnabled: false 로 막는다.)
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      // 폼이 없는 상태(로딩·없음·권한없음)에서는 잃을 내용이 없으므로 그대로 나간다.
      if (state !== 'editable' || leavingRef.current) return false;
      if (exitDialogOpen) {
        setExitDialogOpen(false);
        return true;
      }
      if (submitting) return true;
      setExitDialogOpen(true);
      return true;
    });
    return () => subscription.remove();
  }, [exitDialogOpen, state, submitting]);

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
    exitDialogOpen,
    // 수정 중인 내용은 저장되지 않으므로 폼 화면에서는 확인창을 먼저 띄운다.
    onBack: () => {
      if (state !== 'editable') {
        router.back();
        return;
      }
      setExitDialogOpen(true);
    },
    onExitCancel: () => setExitDialogOpen(false),
    onExitConfirm: () => {
      setExitDialogOpen(false);
      leavingRef.current = true;
      router.back();
    },
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
