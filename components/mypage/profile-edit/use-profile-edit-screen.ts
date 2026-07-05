import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import type { RangeValue } from '@/components/ui/headless';
import {
  compactNumbers,
  getProfileAll,
  lifestyleIdsFromPatternOptions,
  lifestyleModifyItemsFromPatternOptions,
  lifestyleSelectionsFromBackendIds,
  regionBackendId,
  regionFromBackendId,
  roomTypeBackendId,
  saveProfileLifestyle,
  updateProfileLifestyle,
  updateProfileRoomInfo,
  useLifestylePatternOptions,
  withComeableAtNegotiable,
  type LifestyleChoiceGroup,
  type LifestyleScaleOption,
} from '@/lib/api';
import type { Region } from '@/lib/onboarding';

export type UseProfileEditScreenReturn = {
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
  const lifestyleOptions = useLifestylePatternOptions();
  const [scales, setScales] = useState<Record<string, number>>({});
  const [choiceValues, setChoiceValues] = useState<Record<string, string>>({});
  const [loadedLifestyles, setLoadedLifestyles] = useState<{ id?: number; lifestyleId?: number }[]>(
    [],
  );
  const [hasRoom, setHasRoom] = useState<boolean | null>(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [deposit, setDeposit] = useState<RangeValue>([0, 500]);
  const [rent, setRent] = useState<RangeValue>([0, 50]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    getProfileAll().then((res) => {
      if (!mounted || res.error || res.status !== 200 || !res.data) return;
      const data = res.data;
      setLoadedLifestyles(
        (data.lifestyles ?? []).map((item) => ({
          id: item.id,
          lifestyleId: item.lifestyleId,
        })),
      );
      if (data.type) setHasRoom(data.type === 'OFFER');
      setDeposit([data.minDeposit ?? data.deposit ?? 0, data.maxDeposit ?? data.deposit ?? 500]);
      setRent([
        data.minMounthRent ?? data.mounthRent ?? 0,
        data.maxMounthRent ?? data.mounthRent ?? 50,
      ]);
      setMoveInDate(data.comeEnableAt ? new Date(data.comeEnableAt) : null);
      const loadedRegions = (data.region ?? []).flatMap((item) =>
        item.regionId === undefined ? [] : [regionFromBackendId(item.regionId)],
      );
      if (loadedRegions.length > 0) setRegions(loadedRegions);
      const ids = (data.roomProfile ?? []).flatMap((item) =>
        item.roomProfileId === undefined ? [] : [String(item.roomProfileId)],
      );
      if (ids.length > 0) setRoomTypes(ids);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadedLifestyleIds = loadedLifestyles.flatMap((item) =>
      item.lifestyleId === undefined ? [] : [item.lifestyleId],
    );
    if (!loadedLifestyleIds.length) return;
    const next = lifestyleSelectionsFromBackendIds(lifestyleOptions, loadedLifestyleIds);
    if (Object.keys(next.scales).length > 0) {
      setScales((prev) => ({ ...prev, ...next.scales }));
    }
    if (Object.keys(next.choices).length > 0) {
      setChoiceValues((prev) => ({ ...prev, ...next.choices }));
    }
  }, [lifestyleOptions.scaleOptions, lifestyleOptions.choiceGroups, loadedLifestyles]);

  const saveLifestyle = async () => {
    const lifestyles = lifestyleIdsFromPatternOptions(lifestyleOptions, scales, choiceValues);
    if (!lifestyles.length) {
      Alert.alert('입력 확인 필요', '생활 패턴을 하나 이상 선택해주세요.');
      return;
    }

    const modifyItems = lifestyleModifyItemsFromPatternOptions(
      lifestyleOptions,
      loadedLifestyles,
      scales,
      choiceValues,
    );
    const res = modifyItems.length
      ? await updateProfileLifestyle({ lifestyles: modifyItems })
      : await saveProfileLifestyle({ lifestyles });
    Alert.alert(
      res.error ? '저장 실패' : '저장 완료',
      res.error?.message ?? (res.error ? '잠시 후 다시 시도해주세요.' : '생활 패턴이 저장되었어요.'),
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
    const res = await updateProfileRoomInfo(withComeableAtNegotiable({
      type: isOffer ? 'OFFER' : 'SEEKER',
      minDeposit: isOffer ? undefined : deposit[0],
      maxDeposit: isOffer ? undefined : deposit[1],
      minMounthRent: isOffer ? undefined : rent[0],
      maxMounthRent: isOffer ? undefined : rent[1],
      comeEnableAt: moveInDate?.toISOString(),
      region: isOffer ? regionIds.slice(0, 1) : regionIds,
      roomProfile: isOffer ? roomTypeIds.slice(0, 1) : roomTypeIds,
      deposit: isOffer ? deposit[0] : undefined,
      mounthRent: isOffer ? rent[0] : undefined,
    }));
    Alert.alert(
      res.error ? '저장 실패' : '저장 완료',
      res.error?.message ?? (res.error ? '잠시 후 다시 시도해주세요.' : '방 조건이 저장되었어요.'),
    );
  };

  return {
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
    setChoice: (key, next) => setChoiceValues((prev) => ({ ...prev, [key]: next })),
    setHasRoom,
    setRegions,
    setMoveInDate,
    setDeposit,
    setRent,
    setRoomTypes,
    setScale: (key, value) => setScales((prev) => ({ ...prev, [key]: value })),
    onBack: () => router.back(),
    saveLifestyle,
    saveRoom,
  };
}
