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
export const MAX_REGIONS = 10;
export const ROOM_INFO_STAGE_TITLES = ['방 유무 여부', '방 유무 여부', '예산', '방 형태'] as const;
export type RoomInfoStage = 0 | 1 | 2 | 3;

export type RegionDraft = { sido: string | null; gugun: string | null };

const EMPTY_DRAFT: RegionDraft = { sido: null, gugun: null };

export type UseRoomInfoStepProps = {
  onComplete?: () => void;
};

export type UseRoomInfoStepReturn = {
  room: ReturnType<typeof useOnboardingRoom>['room'];
  draft: RegionDraft;
  cityOptions: RegionSelectOption[];
  gugunOptions: RegionSelectOption[];
  roomTypeOptions: RoomTypeOption[];
  regionPickerOpen: boolean;
  regionLoading: boolean;
  regionError: string | null;
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
  setRegionPickerOpen: (open: boolean) => void;
  reloadRegions: () => void;
  selectSido: (value: string) => void;
  selectGugun: (value: string) => void;
  removeRegion: (id: string) => void;
  setDeposit: (value: number | null) => void;
  setMonthlyRent: (value: number | null) => void;
  toggleSingleRoomType: (value: RoomType) => void;
  setBudgetDeposit: (value: { min: number; max: number }) => void;
  setBudgetRent: (value: { min: number; max: number }) => void;
  setBudgetManagement: (value: { min: number; max: number }) => void;
  toggleRoomType: (value: RoomType) => void;
};

export function useRoomInfoStep({ onComplete }: UseRoomInfoStepProps): UseRoomInfoStepReturn {
  const { roomStage } = useGlobalSearchParams<{ roomStage?: string }>();
  const { goNext, goPrev } = useOnboarding();
  const { room, patch } = useOnboardingRoom();
  const regions = useRegionOptions();
  const roomTypes = useRoomTypeOptions();
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
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
      const selected = regions.getOption(room.region.id);
      return { sido: selected?.parentId ?? null, gugun: room.region.id };
    }
    return EMPTY_DRAFT;
  });
  const gugunOptions = draft.sido ? regions.getChildren(draft.sido) : [];

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
    if (stage < 3) {
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
    const region = regionFromDraft(next, regions.getOption);
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
    setRegionPickerOpen(false);
  };

  return {
    room,
    draft,
    cityOptions: regions.cities,
    gugunOptions,
    roomTypeOptions: roomTypes.options,
    regionPickerOpen,
    regionLoading: regions.loading,
    regionError: regions.error,
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
    setHasRoom: (next) => {
      patch({ hasRoom: next });
      setStage(1);
    },
    setRegionPickerOpen,
    reloadRegions: regions.reload,
    selectSido: (value) => setDraft({ sido: value || null, gugun: null }),
    selectGugun: (value) => commitDraft({ ...draft, gugun: value }),
    removeRegion: (id) => patch({ regions: room.regions.filter((r) => r.id !== id) }),
    setDeposit: (value) => patch({ deposit: value }),
    setMonthlyRent: (value) => patch({ monthlyRent: value }),
    toggleSingleRoomType: (value) => patch({ roomType: room.roomType === value ? null : value }),
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
  };
}

function parseRoomInfoStage(value: string | undefined): RoomInfoStage | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 3 ? (parsed as RoomInfoStage) : null;
}

function regionFromDraft(
  d: RegionDraft,
  getOption: (id: string | null | undefined) => RegionSelectOption | undefined,
): Region | null {
  if (!d.sido) return null;
  if (!d.gugun) return null;
  return getOption(d.gugun)?.region ?? null;
}
