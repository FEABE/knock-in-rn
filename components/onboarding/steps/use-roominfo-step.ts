import { useEffect, useRef, useState } from 'react';

import { AnalyticsEvent, logEvent, onboardingTiming } from '@/lib/analytics';
import {
  compactNumbers,
  regionBackendId,
  roomTypeBackendId,
  saveProfileRoomInfo,
  type ProfileRoomInfoRequest,
} from '@/lib/api';
import {
  ONBOARDING_WRITE_ENABLED,
  useOnboarding,
  useOnboardingRoom,
  type Region,
  type RoomType,
} from '@/lib/onboarding';

export const ROOM_INFO_ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'one-room', label: '원룸' },
  { value: 'two-room', label: '투룸' },
  { value: 'three-room+', label: '쓰리룸 이상' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'share-house', label: '쉐어하우스' },
  { value: 'apt', label: '아파트' },
  { value: 'villa', label: '빌라' },
];

export const MAX_PREF_ROOM_TYPES = 3;
export const MAX_REGIONS = 3;

export const SIDO = ['서울', '경기', '인천', '충청'];
export const GUGUN = ['전체', '마포구', '서대문구', '강남구', '송파구', '노원구', '광진구'];
export const DONG = ['전체', '합정동', '망원동', '연남동', '상수동'];

export type RegionDraft = { sido: string | null; gugun: string | null; dong: string | null };

const EMPTY_DRAFT: RegionDraft = { sido: null, gugun: null, dong: null };

export type UseRoomInfoStepProps = {
  onComplete?: () => void;
};

export type UseRoomInfoStepReturn = {
  room: ReturnType<typeof useOnboardingRoom>['room'];
  draft: RegionDraft;
  today: Date;
  hasRoom: boolean;
  noRoom: boolean;
  canProceed: boolean;
  toast: string | null;
  submitting: boolean;
  submitError: string | null;
  onComplete?: () => void;
  setHasRoom: (next: boolean) => void;
  selectSido: (value: string) => void;
  selectGugun: (value: string) => void;
  selectDong: (value: string) => void;
  removeRegion: (id: string) => void;
  setDeposit: (value: number) => void;
  setMonthlyRent: (value: number) => void;
  toggleSingleRoomType: (value: RoomType) => void;
  setMoveInDate: (value: Date | null) => void;
  setBudgetDeposit: (value: { min: number; max: number }) => void;
  setBudgetRent: (value: { min: number; max: number }) => void;
  setBudgetManagement: (value: { min: number; max: number }) => void;
  toggleRoomType: (value: RoomType) => void;
  setMoveInBy: (value: Date | null) => void;
};

export function useRoomInfoStep({ onComplete }: UseRoomInfoStepProps): UseRoomInfoStepReturn {
  const { goNext, isStepSaved, markStepSaved } = useOnboarding();
  const { room, patch } = useOnboardingRoom();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    onboardingTiming.enterStep();
    logEvent(AnalyticsEvent.ONBOARDING_STEP_VIEW, { step_index: 3, step_name: 'room_status' });
  }, []);

  const hasRoom = room.hasRoom === true;
  const noRoom = room.hasRoom === false;

  const [draft, setDraft] = useState<RegionDraft>(() => {
    if (room.hasRoom === true && room.region) {
      const [s, g, d] = room.region.id.split('-');
      return { sido: s ?? null, gugun: g ?? null, dong: d || null };
    }
    return EMPTY_DRAFT;
  });

  const today = startOfToday();
  const moveInValid = room.moveInDate != null && room.moveInDate >= today;
  const moveByValid = room.moveInBy != null && room.moveInBy >= today;

  const canProceed = hasRoom
    ? room.region != null &&
      room.deposit != null &&
      room.monthlyRent != null &&
      room.roomType != null &&
      moveInValid
    : noRoom
      ? room.regions.length > 0 && room.roomTypes.length > 0 && moveByValid
      : false;

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const saveAndProceed = async () => {
    if (!ONBOARDING_WRITE_ENABLED) {
      onComplete?.();
      goNext();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = roomToProfileRoomInfoRequest(room);
      const signature = JSON.stringify(body);
      if (!isStepSaved('roominfo', signature)) {
        const res = await saveProfileRoomInfo(body);
        if (res.status !== 200 || res.error) {
          setSubmitError(res.error?.message ?? `저장에 실패했어요 (status ${res.status})`);
          return;
        }
        markStepSaved('roominfo', signature);
      }
      onComplete?.();
      goNext();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '네트워크 오류가 발생했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const commitDraft = (next: RegionDraft) => {
    const region = regionFromDraft(next);
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
    today,
    hasRoom,
    noRoom,
    canProceed,
    toast,
    submitting,
    submitError,
    onComplete: saveAndProceed,
    setHasRoom: (next) => patch({ hasRoom: next }),
    selectSido: (value) => commitDraft({ ...draft, sido: value }),
    selectGugun: (value) => commitDraft({ ...draft, gugun: value }),
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

function roomToProfileRoomInfoRequest(
  room: ReturnType<typeof useOnboardingRoom>['room'],
): ProfileRoomInfoRequest {
  if (room.hasRoom === true) {
    return {
      type: 'OFFER',
      region: compactNumbers([regionBackendId(room.region)]),
      roomProfile: compactNumbers([roomTypeBackendId(room.roomType)]),
      deposit: room.deposit ?? undefined,
      mounthRent: room.monthlyRent ?? undefined,
      minDeposit: room.deposit ?? undefined,
      maxDeposit: room.deposit ?? undefined,
      minMounthRent: room.monthlyRent ?? undefined,
      maxMounthRent: room.monthlyRent ?? undefined,
      comeEnableAt: toApiDateTime(room.moveInDate),
      comeableAtNegotiable: false,
    };
  }

  return {
    type: 'SEEKER',
    region: compactNumbers(room.regions.map(regionBackendId)),
    roomProfile: compactNumbers(room.roomTypes.map(roomTypeBackendId)),
    minDeposit: room.budgetDeposit.min,
    maxDeposit: room.budgetDeposit.max,
    minMounthRent: room.budgetRent.min,
    maxMounthRent: room.budgetRent.max,
    comeEnableAt: toApiDateTime(room.moveInBy),
    comeableAtNegotiable: false,
  };
}

function toApiDateTime(date: Date | null | undefined): string | undefined {
  return date ? date.toISOString() : undefined;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function regionFromDraft(d: RegionDraft): Region | null {
  if (!d.sido) return null;
  if (d.gugun === '전체') {
    return { id: d.sido, city: d.sido, district: '전체' };
  }
  if (!d.gugun) return null;
  if (d.dong == null) return null;
  if (d.dong === '전체') {
    return { id: `${d.sido}-${d.gugun}`, city: d.sido, district: d.gugun };
  }
  return { id: `${d.sido}-${d.gugun}-${d.dong}`, city: d.sido, district: `${d.gugun} ${d.dong}` };
}
