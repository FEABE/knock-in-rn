import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import type { RangeValue } from '@/components/ui/headless';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  compactNumbers,
  formatApiCalendarDate,
  getProfileAll,
  lifestyleIdsFromPatternOptions,
  lifestyleModifyItemsFromPatternOptions,
  lifestyleSelectionsFromProfileItems,
  parseServerDate,
  regionBackendId,
  regionFromBackendId,
  roomTypeBackendId,
  saveProfileLifestyle,
  serverCalendarDateToLocal,
  updateProfileLifestyle,
  updateProfileRoomInfo,
  useLifestylePatternOptions,
  useRoomTypeOptions,
  withComeableAtNegotiable,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
  type RoomTypeOption,
} from '@/lib/api';
import type { Region } from '@/lib/onboarding';

export type UseProfileEditScreenReturn = {
  initialTab: 'lifestyle' | 'room';
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  scaleOptions: LifestyleScaleOption[];
  choiceGroups: LifestyleChoiceGroup[];
  hasRoom: boolean | null;
  regions: Region[];
  moveInDate: Date | null;
  deposit: RangeValue;
  rent: RangeValue;
  roomTypes: string[];
  roomTypeOptions: RoomTypeOption[];
  bottomPadding: number;
  setChoice: (key: string, next: string) => void;
  setHasRoom: (next: boolean | null) => void;
  setRegions: Dispatch<SetStateAction<Region[]>>;
  setMoveInDate: Dispatch<SetStateAction<Date | null>>;
  setDeposit: Dispatch<SetStateAction<RangeValue>>;
  setRent: Dispatch<SetStateAction<RangeValue>>;
  setRoomTypes: Dispatch<SetStateAction<string[]>>;
  setScale: (key: string, value: number) => void;
  onBack: () => void;
  saveLifestyle: () => Promise<void>;
  saveRoom: () => Promise<void>;
};

export function useProfileEditScreen(): UseProfileEditScreenReturn {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const initialTab = tab === 'room' ? 'room' : 'lifestyle';
  const lifestyleOptions = useLifestylePatternOptions();
  const patternOptions = useMemo(
    () => ({
      scaleOptions: lifestyleOptions.scaleOptions,
      choiceGroups: lifestyleOptions.choiceGroups,
    }),
    [lifestyleOptions.choiceGroups, lifestyleOptions.scaleOptions],
  );
  const roomTypeOptions = useRoomTypeOptions();
  const bottomPadding = useSafeBottomPadding(12, 24);
  const [state, setState] = useState<ProfileEditState>({
    scales: {},
    choiceValues: {},
    loadedLifestyles: [],
    // 서버 값을 읽기 전에는 미선택이다. 기본값을 false로 두면
    // "방이 없어요"가 고른 것처럼 보이고 미입력 검증도 통과해버린다.
    hasRoom: null,
    regions: [],
    moveInDate: null,
    deposit: [0, 500],
    rent: [0, 50],
    roomTypes: [],
  });
  const {
    scales,
    choiceValues,
    loadedLifestyles,
    hasRoom,
    regions,
    moveInDate,
    deposit,
    rent,
    roomTypes,
  } = state;

  const setHasRoom: Dispatch<SetStateAction<boolean | null>> = (next) =>
    setState((current) => ({ ...current, hasRoom: resolveAction(next, current.hasRoom) }));
  const setRegions: Dispatch<SetStateAction<Region[]>> = (next) =>
    setState((current) => ({ ...current, regions: resolveAction(next, current.regions) }));
  const setMoveInDate: Dispatch<SetStateAction<Date | null>> = (next) =>
    setState((current) => ({ ...current, moveInDate: resolveAction(next, current.moveInDate) }));
  const setDeposit: Dispatch<SetStateAction<RangeValue>> = (next) =>
    setState((current) => ({ ...current, deposit: resolveAction(next, current.deposit) }));
  const setRent: Dispatch<SetStateAction<RangeValue>> = (next) =>
    setState((current) => ({ ...current, rent: resolveAction(next, current.rent) }));
  const setRoomTypes: Dispatch<SetStateAction<string[]>> = (next) =>
    setState((current) => ({ ...current, roomTypes: resolveAction(next, current.roomTypes) }));

  useEffect(() => {
    let mounted = true;
    getProfileAll().then((res) => {
      if (!mounted || res.error || res.status !== 200 || !res.data) return;
      const data = res.data;
      const nextLoadedLifestyles = (data.lifestyles ?? []).map((item) => ({
        id: item.id,
        lifestyleId: item.lifestyleId,
        value: item.value,
      }));
      const loadedRegions = (data.region ?? []).flatMap((item) =>
        item.regionId === undefined ? [] : [regionFromBackendId(item.regionId)],
      );
      const ids = (data.roomProfile ?? []).flatMap((item) =>
        item.roomProfileId === undefined ? [] : [String(item.roomProfileId)],
      );
      setState((current) => ({
        ...current,
        loadedLifestyles: nextLoadedLifestyles,
        hasRoom: data.type ? data.type === 'OFFER' : current.hasRoom,
        deposit: [data.minDeposit ?? data.deposit ?? 0, data.maxDeposit ?? data.deposit ?? 500],
        rent: [
          data.minMounthRent ?? data.mounthRent ?? 0,
          data.maxMounthRent ?? data.mounthRent ?? 50,
        ],
        // comeEnableAt은 오프셋 없는 UTC 벽시계다. parseServerDate로 파싱한 뒤
        // 캘린더 위젯이 쓰는 로컬 자정으로 옮긴다.
        moveInDate: toLocalCalendarDate(data.comeEnableAt),
        regions: loadedRegions.length > 0 ? loadedRegions : current.regions,
        roomTypes: ids.length > 0 ? ids : current.roomTypes,
      }));
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loadedLifestyles.length) return;
    const next = lifestyleSelectionsFromProfileItems(patternOptions, loadedLifestyles);
    setState((current) => ({
      ...current,
      scales:
        Object.keys(next.scales).length > 0
          ? { ...current.scales, ...next.scales }
          : current.scales,
      choiceValues:
        Object.keys(next.choices).length > 0
          ? { ...current.choiceValues, ...next.choices }
          : current.choiceValues,
    }));
  }, [loadedLifestyles, patternOptions]);

  const saveLifestyle = async () => {
    const lifestyles = lifestyleIdsFromPatternOptions(patternOptions, scales, choiceValues);
    if (!lifestyles.length) {
      Alert.alert('입력 확인 필요', '생활 패턴을 하나 이상 선택해주세요.');
      return;
    }

    const modifyItems = lifestyleModifyItemsFromPatternOptions(
      patternOptions,
      loadedLifestyles,
      scales,
      choiceValues,
    );
    // PUT(수정)은 이미 저장된 문항의 값만 바꾼다. 서버에 행이 없는 문항(온보딩 이후 추가된
    // 문항 등)은 payload에서 통째로 빠져서 "저장했는데 반영이 안 되는" 상태가 된다.
    // 그래서 답한 문항 전부가 기존 행으로 커버될 때만 PUT을 쓰고, 아니면 POST로 전체 저장한다.
    const canModifyAll = modifyItems.length === lifestyles.length;
    const res = canModifyAll
      ? await updateProfileLifestyle({ lifestyles: modifyItems })
      : await saveProfileLifestyle({ lifestyles });

    if (res.error || res.status !== 200) {
      Alert.alert('저장 실패', saveErrorMessage(res.error, res.status));
      return;
    }
    // 전체 저장(POST)은 기존 행을 지우고 다시 만들기 때문에 id가 바뀐다.
    // 다시 읽어두지 않으면 같은 화면에서 두 번째 저장이 옛 id로 나가 무시된다.
    await refreshLoadedLifestyles();
    Alert.alert('저장 완료', '생활 패턴이 저장되었어요.');
  };

  const refreshLoadedLifestyles = async () => {
    const res = await getProfileAll();
    if (res.error || res.status !== 200 || !res.data) return;
    setState((current) => ({
      ...current,
      loadedLifestyles: (res.data.lifestyles ?? []).map((item) => ({
        id: item.id,
        lifestyleId: item.lifestyleId,
        value: item.value,
      })),
    }));
  };

  const saveRoom = async () => {
    const roomTypeIds = compactNumbers(roomTypes.map(roomTypeBackendId));
    const regionIds = compactNumbers(regions.map(regionBackendId));
    const missing: string[] = [];

    if (hasRoom === null) missing.push('방 여부');
    if (!regionIds.length) missing.push(hasRoom ? '방 위치' : '선호 지역');
    if (!roomTypeIds.length) missing.push(hasRoom ? '방 형태' : '선호 방 형태');
    // 입주(희망)일은 관리 플로우에서 입력받지 않는다(시안에 화면이 없음).
    // 서버는 comeEnableAt이 필수라 기존 저장값을 그대로 다시 보낸다.

    if (missing.length) {
      Alert.alert(
        '입력 확인 필요',
        `다음 항목을 입력해주세요.\n\n${missing.map((item) => `- ${item}`).join('\n')}`,
      );
      return;
    }

    const isOffer = hasRoom === true;
    const res = await updateProfileRoomInfo(
      withComeableAtNegotiable({
        type: isOffer ? 'OFFER' : 'SEEKER',
        minDeposit: isOffer ? undefined : deposit[0],
        maxDeposit: isOffer ? undefined : deposit[1],
        minMonthlyRent: isOffer ? undefined : rent[0],
        maxMonthlyRent: isOffer ? undefined : rent[1],
        // 입주(희망)일은 캘린더 날짜다. 서버 LocalDateTime = UTC 벽시계이므로 UTC 자정으로 맞춰 보낸다.
        comeEnableAt: formatApiCalendarDate(moveInDate ?? new Date()),
        region: isOffer ? regionIds.slice(0, 1) : regionIds,
        roomProfile: isOffer ? roomTypeIds.slice(0, 1) : roomTypeIds,
        deposit: isOffer ? deposit[0] : undefined,
        monthlyRent: isOffer ? rent[0] : undefined,
      }),
    );
    if (res.error || res.status !== 200) {
      Alert.alert('저장 실패', saveErrorMessage(res.error, res.status));
      return;
    }
    Alert.alert('저장 완료', '방 조건이 저장되었어요.');
  };

  return {
    initialTab,
    scales,
    choiceValues,
    scaleOptions: lifestyleOptions.scaleOptions,
    choiceGroups: lifestyleOptions.choiceGroups,
    hasRoom,
    regions,
    moveInDate,
    deposit,
    rent,
    roomTypes,
    roomTypeOptions: roomTypeOptions.options,
    bottomPadding,
    setChoice: (key, next) =>
      setState((current) => ({
        ...current,
        choiceValues: { ...current.choiceValues, [key]: next },
      })),
    setHasRoom,
    setRegions,
    setMoveInDate,
    setDeposit,
    setRent,
    setRoomTypes,
    setScale: (key, value) =>
      setState((current) => ({
        ...current,
        scales: { ...current.scales, [key]: value },
      })),
    onBack: () => router.back(),
    saveLifestyle,
    saveRoom,
  };
}

type ProfileEditState = {
  scales: Record<string, number>;
  choiceValues: Record<string, string>;
  loadedLifestyles: { id?: number; lifestyleId?: number; value?: string }[];
  hasRoom: boolean | null;
  regions: Region[];
  moveInDate: Date | null;
  deposit: RangeValue;
  rent: RangeValue;
  roomTypes: string[];
};

/** 저장 실패 원인을 QA에서 바로 잡을 수 있게 서버 코드/상태까지 함께 보여준다. */
function saveErrorMessage(
  error: { code?: string; message: string } | null,
  status: number,
): string {
  if (!error) return `잠시 후 다시 시도해주세요. (status ${status})`;
  return `${error.message}${error.code ? ` (${error.code})` : ''} (status ${status})`;
}

function resolveAction<T>(next: SetStateAction<T>, current: T): T {
  return typeof next === 'function' ? (next as (value: T) => T)(current) : next;
}

/** 서버가 UTC 자정으로 저장한 캘린더 날짜 문자열을 로컬 자정 Date로 되돌린다. */
function toLocalCalendarDate(value?: string | null): Date | null {
  const parsed = parseServerDate(value);
  return parsed ? serverCalendarDateToLocal(parsed) : null;
}
