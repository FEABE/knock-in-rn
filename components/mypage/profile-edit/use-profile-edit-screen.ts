import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import type { RangeValue } from '@/components/ui/headless';
import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  compactNumbers,
  formatApiLocalDateTime,
  getProfileAll,
  lifestyleIdsFromPatternOptions,
  lifestyleModifyItemsFromPatternOptions,
  lifestyleSelectionsFromProfileItems,
  regionBackendId,
  regionFromBackendId,
  roomTypeBackendId,
  saveProfileLifestyle,
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
    hasRoom: false,
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
        moveInDate: data.comeEnableAt ? new Date(data.comeEnableAt) : null,
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
    const res = modifyItems.length
      ? await updateProfileLifestyle({ lifestyles: modifyItems })
      : await saveProfileLifestyle({ lifestyles });
    Alert.alert(
      res.error ? '저장 실패' : '저장 완료',
      res.error?.message ??
        (res.error ? '잠시 후 다시 시도해주세요.' : '생활 패턴이 저장되었어요.'),
    );
  };

  const saveRoom = async () => {
    const roomTypeIds = compactNumbers(roomTypes.map(roomTypeBackendId));
    const regionIds = compactNumbers(regions.map(regionBackendId));
    const missing: string[] = [];

    if (hasRoom === null) missing.push('방 여부');
    if (!regionIds.length) missing.push(hasRoom ? '방 위치' : '선호 지역');
    if (!roomTypeIds.length) missing.push(hasRoom ? '방 형태' : '선호 방 형태');
    if (!moveInDate) missing.push(hasRoom ? '입주 가능 시기' : '입주 희망 시기');

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
        comeEnableAt: formatApiLocalDateTime(moveInDate ?? new Date()),
        region: isOffer ? regionIds.slice(0, 1) : regionIds,
        roomProfile: isOffer ? roomTypeIds.slice(0, 1) : roomTypeIds,
        deposit: isOffer ? deposit[0] : undefined,
        monthlyRent: isOffer ? rent[0] : undefined,
      }),
    );
    Alert.alert(
      res.error ? '저장 실패' : '저장 완료',
      res.error?.message ?? (res.error ? '잠시 후 다시 시도해주세요.' : '방 조건이 저장되었어요.'),
    );
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

function resolveAction<T>(next: SetStateAction<T>, current: T): T {
  return typeof next === 'function' ? (next as (value: T) => T)(current) : next;
}
