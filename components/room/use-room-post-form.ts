import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  useRoomAddOptionOptions,
  useRoomTypeOptions,
  type RoomAddOptionSelectOption,
  type RoomTypeOption,
} from '@/lib/api';
import type { Region, RoomType } from '@/lib/onboarding';

import {
  draftToValues,
  emptyRoomFormDraft,
  formatDraftDate,
  isBudgetSectionValid,
  isIntroSectionValid,
  isLocationSectionValid,
  isMoveInSectionValid,
  isRoomFormDraftValid,
  isRoomTitleLongEnough,
  isRoomTypeSectionValid,
  parseDate,
  type RoomFormDraft,
  type RoomFormValues,
  MAX_ROOM_DESCRIPTION_LENGTH,
  MAX_ROOM_PHOTOS,
  MIN_ROOM_TITLE_LENGTH,
} from './room-post-form.model';

/** 등록 위저드 페이지 순서. 디자인 플로우(생활패턴 → 방형태 → 위치 → 예산 → 입주일 → 옵션 → 소개)를 따른다. */
export const ROOM_WIZARD_PAGES = [
  'lifestyle',
  'roomType',
  'location',
  'budget',
  'moveIn',
  'options',
  'intro',
] as const;

export type RoomWizardPage = (typeof ROOM_WIZARD_PAGES)[number];

/** 페이지 → 상단 스텝 탭(01 생활패턴 / 02 방 정보 / 03 방 소개) 매핑. */
const PAGE_STEP: Record<RoomWizardPage, number> = {
  lifestyle: 0,
  roomType: 1,
  location: 1,
  budget: 1,
  moveIn: 1,
  options: 1,
  intro: 2,
};

const TITLE_TOAST_MESSAGE = `제목은 최소 ${MIN_ROOM_TITLE_LENGTH}자 이상 입력해주세요`;
const TOAST_DURATION_MS = 2000;

export type UseRoomPostFormProps = {
  initial?: Partial<RoomFormDraft>;
  onSubmit: (values: RoomFormValues) => void;
  mode: 'create' | 'edit';
};

export type UseRoomPostFormReturn = {
  draft: RoomFormDraft;
  canSubmit: boolean;
  photoCount: number;
  selectingPhotos: boolean;
  bottomPadding: number;
  roomTypes: RoomTypeOption[];
  roomOptions: RoomAddOptionSelectOption[];
  roomTypesLoading: boolean;
  roomTypesError: string | null;
  roomOptionsLoading: boolean;
  roomOptionsError: string | null;
  selectedRegion: Region | null;
  regionSheetOpen: boolean;
  setRegionSheetOpen: (open: boolean) => void;
  moveInDate: Date | null;
  page: RoomWizardPage;
  stepIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  canProceed: boolean;
  goNext: () => void;
  goPrev: () => void;
  toastMessage: string | null;
  setTitle: (next: string) => void;
  setDeposit: (next: string) => void;
  setRent: (next: string) => void;
  setMaintenance: (next: string) => void;
  selectRoomType: (next: RoomType) => void;
  selectRegion: (next: Region) => void;
  setMoveInDate: (next: string) => void;
  selectMoveInDate: (next: Date) => void;
  setNegotiable: (next: boolean) => void;
  addPhotos: () => Promise<void>;
  removePhoto: (index: number) => void;
  toggleOption: (next: number) => void;
  setDescription: (next: string) => void;
  reloadRoomTypes: () => void;
  reloadRoomOptions: () => void;
  submit: () => void;
};

export function useRoomPostForm({
  initial,
  onSubmit,
}: UseRoomPostFormProps): UseRoomPostFormReturn {
  const roomTypeOptions = useRoomTypeOptions();
  const roomAddOptions = useRoomAddOptionOptions();
  const [state, setState] = useState(() => ({
    draft: {
      ...emptyRoomFormDraft(),
      ...initial,
    } as RoomFormDraft,
    selectingPhotos: false,
    regionSheetOpen: false,
    pageIndex: 0,
    toastMessage: null as string | null,
  }));
  const { draft, selectingPhotos, regionSheetOpen, pageIndex, toastMessage } = state;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setState((current) => ({ ...current, toastMessage: message }));
    toastTimer.current = setTimeout(() => {
      setState((current) => ({ ...current, toastMessage: null }));
    }, TOAST_DURATION_MS);
  }, []);

  const patch = (next: Partial<RoomFormDraft>) => {
    setState((current) => ({
      ...current,
      draft: { ...current.draft, ...next },
    }));
  };

  const canSubmit = isRoomFormDraftValid(draft);
  const bottomPadding = useSafeBottomPadding(12, 12);

  const page = ROOM_WIZARD_PAGES[pageIndex];
  const canProceed = isPageValid(page, draft);
  const isLastPage = pageIndex === ROOM_WIZARD_PAGES.length - 1;

  const submit = () => {
    if (!isRoomTitleLongEnough(draft)) {
      showToast(TITLE_TOAST_MESSAGE);
      return;
    }
    const values = draftToValues(draft);
    if (values) onSubmit(values);
  };

  return {
    draft,
    canSubmit,
    photoCount: draft.imageUris.length,
    selectingPhotos,
    bottomPadding,
    roomTypes: roomTypeOptions.options,
    roomOptions: roomAddOptions.options,
    roomTypesLoading: roomTypeOptions.loading,
    roomTypesError: roomTypeOptions.error,
    roomOptionsLoading: roomAddOptions.loading,
    roomOptionsError: roomAddOptions.error,
    selectedRegion: draft.regions[0] ?? null,
    regionSheetOpen,
    setRegionSheetOpen: (open) => setState((current) => ({ ...current, regionSheetOpen: open })),
    moveInDate: parseDate(draft.moveInDate) ?? null,
    page,
    stepIndex: PAGE_STEP[page],
    isFirstPage: pageIndex === 0,
    isLastPage,
    canProceed,
    goNext: () => {
      if (isLastPage) {
        submit();
        return;
      }
      if (!canProceed) return;
      setState((current) => ({
        ...current,
        pageIndex: Math.min(current.pageIndex + 1, ROOM_WIZARD_PAGES.length - 1),
      }));
    },
    goPrev: () =>
      setState((current) => ({ ...current, pageIndex: Math.max(current.pageIndex - 1, 0) })),
    toastMessage,
    setTitle: (next) => patch({ title: next }),
    setDeposit: (next) => patch({ deposit: next }),
    setRent: (next) => patch({ rent: next }),
    setMaintenance: (next) => patch({ maintenance: next }),
    selectRoomType: (next) => patch({ roomType: next }),
    selectRegion: (next) => patch({ regions: [next] }),
    setMoveInDate: (next) => patch({ moveInDate: next }),
    selectMoveInDate: (next) => patch({ moveInDate: formatDraftDate(next) }),
    setNegotiable: (next) => patch({ negotiable: next }),
    addPhotos: async () => {
      const remaining = MAX_ROOM_PHOTOS - draft.imageUris.length;
      if (remaining <= 0 || selectingPhotos) return;

      setState((current) => ({ ...current, selectingPhotos: true }));
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          selectionLimit: remaining,
          quality: 0.85,
        });
        if (result.canceled) return;
        const nextUris = result.assets.map((asset) => asset.uri).filter(Boolean);
        setState((current) => ({
          ...current,
          draft: {
            ...current.draft,
            imageUris: [...current.draft.imageUris, ...nextUris].slice(0, MAX_ROOM_PHOTOS),
          },
        }));
      } catch (error) {
        Alert.alert(
          '사진 선택 실패',
          error instanceof Error ? error.message : '사진을 불러오지 못했습니다.',
        );
      } finally {
        setState((current) => ({ ...current, selectingPhotos: false }));
      }
    },
    removePhoto: (index) =>
      setState((current) => ({
        ...current,
        draft: {
          ...current.draft,
          imageUris: current.draft.imageUris.filter((_, photoIndex) => photoIndex !== index),
        },
      })),
    toggleOption: (next) => {
      if (!draft.options.includes(next) && draft.options.length >= 4) return;
      patch({
        options: draft.options.includes(next)
          ? draft.options.filter((option) => option !== next)
          : [...draft.options, next],
      });
    },
    setDescription: (next) => patch({ description: next.slice(0, MAX_ROOM_DESCRIPTION_LENGTH) }),
    reloadRoomTypes: roomTypeOptions.reload,
    reloadRoomOptions: roomAddOptions.reload,
    submit,
  };
}

function isPageValid(page: RoomWizardPage, draft: RoomFormDraft): boolean {
  switch (page) {
    case 'lifestyle':
    case 'options':
      return true;
    case 'roomType':
      return isRoomTypeSectionValid(draft);
    case 'location':
      return isLocationSectionValid(draft);
    case 'budget':
      return isBudgetSectionValid(draft);
    case 'moveIn':
      return isMoveInSectionValid(draft);
    case 'intro':
      return isIntroSectionValid(draft);
  }
}
