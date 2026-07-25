import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useMemo, useState } from 'react';

import {
  createCalendar,
  deleteCalendar,
  getCalendarEdit,
  getCalendars,
  getDailyCalendars,
  getMyRoommate,
  removeRoommate,
  updateCalendar,
  useApi,
  type CalendarDayItem,
} from '@/lib/api';
import { goChatRoom, goMypageAgreement } from '@/lib/navigation/routes';

export type CalendarEditor = {
  calendarId?: string;
  title: string;
  contents: string;
  categoryName: string;
  startHour: string;
  endHour: string;
};

export function useRoommateManagementScreen() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => formatDate(today));
  const [editor, setEditor] = useState<CalendarEditor | null>(null);
  const [saving, setSaving] = useState(false);
  const year = month.getFullYear();
  const monthNumber = month.getMonth() + 1;
  const selected = parseDate(selectedDate);

  const roommateState = useApi(['roommates', 'me'], () => getMyRoommate(), { retry: false });
  const hasRoommate = Boolean(roommateState.data?.id);
  const noRoommate = roommateState.error === '연결된 룸메이트가 없습니다.';
  const monthState = useApi(
    ['roommates', 'calendar', 'month', year, monthNumber],
    () => getCalendars({ year, month: monthNumber }),
    { enabled: hasRoommate, retry: false },
  );
  const dayState = useApi(
    ['roommates', 'calendar', 'day', selectedDate],
    () =>
      getDailyCalendars({
        year: selected.getFullYear(),
        month: selected.getMonth() + 1,
        day: selected.getDate(),
      }),
    { enabled: hasRoommate, retry: false },
  );
  const editState = useApi(['roommates', 'calendar', 'edit'], () => getCalendarEdit(), {
    enabled: hasRoommate,
    retry: false,
  });
  const categories = editState.data?.categoryNames ?? ['청소', '공과금', '기타'];

  const openCreate = () =>
    setEditor({
      title: '',
      contents: '',
      categoryName: categories[0] ?? '기타',
      startHour: '09:00',
      endHour: '10:00',
    });

  const openEdit = (item: CalendarDayItem) => {
    const info = item.calendarBasicInfo;
    if (!info?.calendarId) return;
    setEditor({
      calendarId: String(info.calendarId),
      title: info.title ?? '',
      contents: info.contents ?? '',
      categoryName: info.categoryName ?? categories[0] ?? '기타',
      startHour: timePart(info.startDate) ?? '09:00',
      endHour: timePart(info.endDate) ?? '10:00',
    });
  };

  const save = async () => {
    if (!editor || !roommateState.data?.id || saving) return;
    if (!editor.title.trim() || !editor.contents.trim()) {
      Alert.alert('입력 확인', '일정 제목과 내용을 모두 입력해주세요.');
      return;
    }
    if (!isValidTime(editor.startHour) || !isValidTime(editor.endHour)) {
      Alert.alert('시간 확인', '시간을 00:00부터 23:59 사이의 형식으로 입력해주세요.');
      return;
    }
    if (editor.endHour <= editor.startHour) {
      Alert.alert('시간 확인', '종료 시간은 시작 시간보다 늦어야 해요.');
      return;
    }
    setSaving(true);
    try {
      const memberIds = (editState.data?.members ?? []).flatMap((member) =>
        member.memberId ? [member.memberId] : [],
      );
      const body = {
        calendar: {
          myRoommateId: roommateState.data.id,
          title: editor.title.trim(),
          contents: editor.contents.trim(),
          startDate: `${selectedDate}T${editor.startHour}:00`,
          endDate: `${selectedDate}T${editor.endHour}:00`,
        },
        categoryName: editor.categoryName,
        memberIds,
      };
      const response = editor.calendarId
        ? await updateCalendar(editor.calendarId, body)
        : await createCalendar(body);
      if (response.status !== 200 || response.error) {
        throw new Error(response.error?.message ?? '일정을 저장하지 못했어요.');
      }
      setEditor(null);
      monthState.reload();
      dayState.reload();
    } catch (error) {
      Alert.alert(
        '저장 실패',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = (calendarId?: number) => {
    if (!calendarId || saving) return;
    Alert.alert('일정 삭제', '이 일정을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setSaving(true);
          void deleteCalendar(String(calendarId))
            .then((response) => {
              if (response.status !== 200 || response.error) {
                throw new Error(response.error?.message ?? '일정을 삭제하지 못했어요.');
              }
              monthState.reload();
              dayState.reload();
            })
            .catch((error) => {
              Alert.alert(
                '삭제 실패',
                error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
              );
            })
            .finally(() => setSaving(false));
        },
      },
    ]);
  };

  const disconnect = () => {
    const roommateId = roommateState.data?.id;
    if (!roommateId || saving) return;
    Alert.alert(
      '룸메이트 연결 해제',
      '합의서와 캘린더를 더 이상 함께 사용할 수 없어요. 연결을 해제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해제',
          style: 'destructive',
          onPress: () => {
            setSaving(true);
            void removeRoommate(String(roommateId))
              .then((response) => {
                if (response.status !== 200 || response.error) {
                  throw new Error(response.error?.message ?? '룸메이트 연결을 해제하지 못했어요.');
                }
                roommateState.reload();
              })
              .catch((error) => {
                Alert.alert(
                  '해제 실패',
                  error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
                );
              })
              .finally(() => setSaving(false));
          },
        },
      ],
    );
  };

  const moveMonth = (offset: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    setSelectedDate(formatDate(next));
    setEditor(null);
  };

  return {
    roommate: roommateState.data,
    loading: roommateState.loading,
    error: noRoommate ? null : roommateState.error,
    saving,
    month,
    selectedDate,
    monthDays: monthState.data?.calendarDays ?? [],
    monthLoading: monthState.loading,
    events: dayState.data?.calendars ?? [],
    dayLoading: dayState.loading,
    categories,
    editor,
    onBack: () => router.back(),
    previousMonth: () => moveMonth(-1),
    nextMonth: () => moveMonth(1),
    selectDate: setSelectedDate,
    openCreate,
    openEdit,
    closeEditor: () => setEditor(null),
    updateEditor: (patch: Partial<CalendarEditor>) =>
      setEditor((current) => (current ? { ...current, ...patch } : current)),
    save,
    removeEvent,
    openAgreement: () => goMypageAgreement(router),
    openChat: () => {
      if (roommateState.data?.chatRoomId) goChatRoom(router, roommateState.data.chatRoomId);
    },
    disconnect,
  };
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function timePart(value?: string): string | null {
  if (!value?.includes('T')) return null;
  return value.split('T')[1]?.slice(0, 5) ?? null;
}

function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
