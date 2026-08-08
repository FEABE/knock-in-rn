import { useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import { useRegionOptions, useRoomTypeOptions, type RoomTypeOption } from '@/lib/api';
import {
  MAX_ROOM_CONDITION_DEPOSIT,
  ROOM_INFO_PROGRESS_START,
  useOnboarding,
  useOnboardingRoom,
  type Region,
  type RoomType,
} from '@/lib/onboarding';

export const MAX_PREF_ROOM_TYPES = 3;
export const MAX_REGIONS = 10;
export const ROOM_INFO_STAGE_TITLES = ['방 유무 여부', '방 유무 여부', '예산', '방 형태'] as const;
export type RoomInfoStage = 0 | 1 | 2 | 3;

export type UseRoomInfoStepProps = {
  onComplete?: () => void;
};

export type UseRoomInfoStepReturn = {
  room: ReturnType<typeof useOnboardingRoom>['room'];
  roomTypeOptions: RoomTypeOption[];
  roomTypeLoading: boolean;
  roomTypeError: string | null;
  regionPickerOpen: boolean;
  stage: RoomInfoStage;
  stageTitle: (typeof ROOM_INFO_STAGE_TITLES)[RoomInfoStage];
  stageProgress: number;
  hasRoom: boolean;
  noRoom: boolean;
  canProceed: boolean;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onNext: () => void;
  setHasRoom: (next: boolean) => void;
  setRegionPickerOpen: (open: boolean) => void;
  reloadRoomTypes: () => void;
  setRegion: (region: Region) => void;
  setRegions: (regions: Region[]) => void;
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
  const [stage, setStage] = useState<RoomInfoStage>(() => {
    if (__DEV__) {
      const previewStage = parseRoomInfoStage(roomStage);
      if (previewStage !== null) return previewStage;
    }
    return room.roomType != null || room.roomTypes.length > 0 ? 3 : 0;
  });

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
  const selectedRoomRegion = regions.getOption(room.region?.id);
  const selectedRoomRegionParent = regions.getOption(selectedRoomRegion?.parentId);
  const hasNeighborhoodRegion = selectedRoomRegionParent?.parentId != null;

  const canProceed =
    stage === 0
      ? hasRoom || noRoom
      : stage === 1
        ? hasRoom
          ? room.region != null && hasNeighborhoodRegion
          : room.regions.length > 0
        : stage === 2
          ? hasRoom
            ? room.deposit != null &&
              room.deposit <= MAX_ROOM_CONDITION_DEPOSIT &&
              room.monthlyRent != null
            : true
          : stage === 3
            ? hasRoom
              ? !roomTypes.error && room.roomType != null
              : !roomTypes.error && room.roomTypes.length > 0
            : true;

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

  return {
    room,
    roomTypeOptions: roomTypes.options,
    roomTypeLoading: roomTypes.loading,
    roomTypeError: roomTypes.error,
    regionPickerOpen,
    stage,
    stageTitle: ROOM_INFO_STAGE_TITLES[stage],
    stageProgress: ROOM_INFO_PROGRESS_START + stage,
    hasRoom,
    noRoom,
    canProceed,
    submitting: false,
    submitError: null,
    onBack,
    onNext,
    setHasRoom: (next) => {
      patch({ hasRoom: next });
      setStage(1);
    },
    setRegionPickerOpen,
    reloadRoomTypes: roomTypes.reload,
    setRegion: (region) => patch({ region }),
    setRegions: (regions) => patch({ regions }),
    removeRegion: (id) => patch({ regions: room.regions.filter((r) => r.id !== id) }),
    setDeposit: (value) =>
      patch({
        deposit: value == null ? null : Math.min(MAX_ROOM_CONDITION_DEPOSIT, Math.max(0, value)),
      }),
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
