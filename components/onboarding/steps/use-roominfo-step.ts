import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  useRegionOptions,
  useRoomTypeOptions,
  type RegionSelectOption,
  type RoomTypeOption,
} from '@/lib/api';
import { useOnboarding, useOnboardingRoom, type Region, type RoomType } from '@/lib/onboarding';

export const MAX_PREF_ROOM_TYPES = 3;
export const MAX_REGIONS = 3;
export const ROOM_INFO_STAGE_TITLES = [
  '방 유무 여부',
  '위치',
  '가격',
  '방 형태',
  '입주 시기',
  '완료',
] as const;
export type RoomInfoStage = 0 | 1 | 2 | 3 | 4 | 5;

export type RegionDraft = { sido: string | null; gugun: string | null; dong: string | null };

const EMPTY_DRAFT: RegionDraft = { sido: null, gugun: null, dong: null };

export type UseRoomInfoStepProps = {
  onComplete?: () => void;
};

export type UseRoomInfoStepReturn = {
  room: ReturnType<typeof useOnboardingRoom>['room'];
  draft: RegionDraft;
  cityOptions: RegionSelectOption[];
  gugunOptions: RegionSelectOption[];
  dongOptions: RegionSelectOption[];
  roomTypeOptions: RoomTypeOption[];
  today: Date;
  stage: RoomInfoStage;
  stageTitle: (typeof ROOM_INFO_STAGE_TITLES)[RoomInfoStage];
  stageProgress: number;
  hasRoom: boolean;
  noRoom: boolean;
  canProceed: boolean;
  toast: string | null;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onNext: () => void;
  setHasRoom: (next: boolean) => void;
  selectSido: (value: string) => void;
  selectGugun: (value: string) => void;
  selectDong: (value: string) => void;
  removeRegion: (id: string) => void;
  setDeposit: (value: number | null) => void;
  setMonthlyRent: (value: number | null) => void;
  toggleSingleRoomType: (value: RoomType) => void;
  setMoveInDate: (value: Date | null) => void;
  setBudgetDeposit: (value: { min: number; max: number }) => void;
  setBudgetRent: (value: { min: number; max: number }) => void;
  setBudgetManagement: (value: { min: number; max: number }) => void;
  toggleRoomType: (value: RoomType) => void;
  setMoveInBy: (value: Date | null) => void;
};

export function useRoomInfoStep({ onComplete }: UseRoomInfoStepProps): UseRoomInfoStepReturn {
  const { roomStage } = useGlobalSearchParams<{ roomStage?: string }>();
  const { goNext, goPrev } = useOnboarding();
  const { room, patch } = useOnboardingRoom();
  const regions = useRegionOptions();
  const roomTypes = useRoomTypeOptions();
  const [stage, setStage] = useState<RoomInfoStage>(() =>
    __DEV__ ? (parseRoomInfoStage(roomStage) ?? 0) : 0,
  );

  useEffect(() => {
    if (!__DEV__) return;
    const nextStage = parseRoomInfoStage(roomStage);
    if (nextStage !== null) setStage(nextStage);
  }, [roomStage]);

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 3, step_name: 'room_status' });
  }, []);

  const hasRoom = room.hasRoom === true;
  const noRoom = room.hasRoom === false;

  const [draft, setDraft] = useState<RegionDraft>(() => {
    if (room.hasRoom === true && room.region) {
      return { sido: null, gugun: null, dong: room.region.id };
    }
    return EMPTY_DRAFT;
  });
  const gugunOptions = draft.sido ? regions.getChildren(draft.sido) : [];
  const childDongOptions = draft.gugun ? regions.getChildren(draft.gugun) : [];
  const selectedGugun = draft.gugun ? regions.getOption(draft.gugun) : undefined;
  const dongOptions = selectedGugun ? [selectedGugun, ...childDongOptions] : [];

  const today = startOfToday();
  const moveInValid = room.moveInDate != null && room.moveInDate >= today;
  const moveByValid = room.moveInBy != null && room.moveInBy >= today;

  const canProceed =
    stage === 0
      ? hasRoom || noRoom
      : stage === 1
        ? hasRoom
          ? room.region != null
          : room.regions.length > 0
        : stage === 2
          ? hasRoom
            ? room.deposit != null && room.monthlyRent != null
            : true
          : stage === 3
            ? hasRoom
              ? room.roomType != null
              : room.roomTypes.length > 0
            : stage === 4
              ? hasRoom
                ? moveInValid
                : moveByValid
              : true;

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const onNext = () => {
    if (!canProceed) return;
    if (stage < 5) {
      setStage((stage + 1) as RoomInfoStage);
      return;
    }
    onComplete?.();
    goNext();
  };

  const onBack = () => {
    if (stage > 0) {
      setStage((stage - 1) as RoomInfoStage);
      return;
    }
    goPrev();
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const commitDraft = (next: RegionDraft) => {
    const region = regionFromDraft(next, regions.getOption, regions.getChildren);
    if (!region) {
      setDraft(next);
      return;
    }
    if (hasRoom) {
      patch({ region });
      setDraft(next);
    } else {
      const dup = room.regions.some((r) => r.id === region.id);
      if (dup) {
        // no-op
      } else if (room.regions.length >= MAX_REGIONS) {
        showToast(`최대 ${MAX_REGIONS}개까지만 선택 가능합니다.`);
      } else {
        patch({ regions: [...room.regions, region] });
      }
      setDraft(EMPTY_DRAFT);
    }
  };

  return {
    room,
    draft,
    cityOptions: regions.cities,
    gugunOptions,
    dongOptions,
    roomTypeOptions: roomTypes.options,
    today,
    stage,
    stageTitle: ROOM_INFO_STAGE_TITLES[stage],
    stageProgress: Math.min(11 + stage, 15),
    hasRoom,
    noRoom,
    canProceed,
    toast,
    submitting: false,
    submitError: null,
    onBack,
    onNext,
    setHasRoom: (next) => patch({ hasRoom: next }),
    selectSido: (value) => commitDraft({ sido: value, gugun: null, dong: null }),
    selectGugun: (value) => commitDraft({ ...draft, gugun: value, dong: null }),
    selectDong: (value) => commitDraft({ ...draft, dong: value }),
    removeRegion: (id) => patch({ regions: room.regions.filter((r) => r.id !== id) }),
    setDeposit: (value) => patch({ deposit: value }),
    setMonthlyRent: (value) => patch({ monthlyRent: value }),
    toggleSingleRoomType: (value) => patch({ roomType: room.roomType === value ? null : value }),
    setMoveInDate: (value) => patch({ moveInDate: value }),
    setBudgetDeposit: (value) => patch({ budgetDeposit: value }),
    setBudgetRent: (value) => patch({ budgetRent: value }),
    setBudgetManagement: (value) => patch({ budgetManagement: value }),
    toggleRoomType: (value) => {
      if (room.roomTypes.includes(value)) {
        patch({ roomTypes: room.roomTypes.filter((v) => v !== value) });
      } else if (room.roomTypes.length < MAX_PREF_ROOM_TYPES) {
        patch({ roomTypes: [...room.roomTypes, value] });
      }
    },
    setMoveInBy: (value) => patch({ moveInBy: value }),
  };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseRoomInfoStage(value: string | undefined): RoomInfoStage | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? (parsed as RoomInfoStage) : null;
}

function regionFromDraft(
  d: RegionDraft,
  getOption: (id: string | null | undefined) => RegionSelectOption | undefined,
  getChildren: (id: string | null | undefined) => RegionSelectOption[],
): Region | null {
  if (!d.sido) return null;
  if (!d.gugun) return null;
  if (!getChildren(d.gugun).length) return getOption(d.gugun)?.region ?? null;
  if (!d.dong) return null;
  return getOption(d.dong)?.region ?? null;
}
