import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useSafeBottomPadding } from '@/hooks/use-safe-bottom-padding';
import {
  useRegionOptions,
  useRoomAddOptionOptions,
  useRoomTypeOptions,
  type RegionSelectOption,
  type RoomAddOptionSelectOption,
  type RoomTypeOption,
} from '@/lib/api';
import type { Region, RoomType } from '@/lib/onboarding';

import {
  draftToValues,
  emptyRoomFormDraft,
  isRoomFormDraftValid,
  type RoomFormDraft,
  type RoomFormValues,
  MAX_ROOM_PHOTOS,
} from './room-post-form.model';

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
  regionCities: RegionSelectOption[];
  regionDistricts: RegionSelectOption[];
  regionNeighborhoods: RegionSelectOption[];
  activeRegionCityId: string | null;
  activeRegionDistrictId: string | null;
  setTitle: (next: string) => void;
  setDeposit: (next: string) => void;
  setRent: (next: string) => void;
  setMaintenance: (next: string) => void;
  selectRoomType: (next: RoomType) => void;
  selectRegionCity: (next: string) => void;
  selectRegionDistrict: (next: string) => void;
  selectRegion: (next: Region) => void;
  setMoveInDate: (next: string) => void;
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
  const regions = useRegionOptions();
  const {
    cities: regionCities,
    getChildren: getRegionChildren,
    getOption: getRegionOption,
  } = regions;
  const roomTypeOptions = useRoomTypeOptions();
  const roomAddOptions = useRoomAddOptionOptions();
  const [state, setState] = useState(() => ({
    draft: {
      ...emptyRoomFormDraft(),
      ...initial,
    } as RoomFormDraft,
    selectingPhotos: false,
    activeRegionCityId: null as string | null,
    activeRegionDistrictId: null as string | null,
  }));
  const { draft, selectingPhotos, activeRegionCityId, activeRegionDistrictId } = state;

  useEffect(() => {
    if (regionCities.length === 0) return;
    setState((current) => {
      const selected = getRegionOption(current.draft.regions[0]?.id);
      const selectedParent = getRegionOption(selected?.parentId);
      const selectedGrandParent = getRegionOption(selectedParent?.parentId);
      const selectedCityId = selectedGrandParent?.id ?? selectedParent?.id ?? selected?.id;
      const selectedDistrictId = selectedGrandParent
        ? selectedParent?.id
        : selected?.parentId
          ? selected.id
          : null;
      const activeCityStillExists = regionCities.some(
        (city) => city.id === current.activeRegionCityId,
      );
      const nextCityId = activeCityStillExists
        ? current.activeRegionCityId
        : (selectedCityId ?? regionCities[0].id);
      const districts = getRegionChildren(nextCityId);
      const activeDistrictStillExists = districts.some(
        (district) => district.id === current.activeRegionDistrictId,
      );
      const nextDistrictId = activeDistrictStillExists
        ? current.activeRegionDistrictId
        : selectedDistrictId && districts.some((district) => district.id === selectedDistrictId)
          ? selectedDistrictId
          : (districts[0]?.id ?? null);
      if (
        current.activeRegionCityId === nextCityId &&
        current.activeRegionDistrictId === nextDistrictId
      ) {
        return current;
      }
      return {
        ...current,
        activeRegionCityId: nextCityId,
        activeRegionDistrictId: nextDistrictId,
      };
    });
  }, [getRegionChildren, getRegionOption, regionCities]);

  const regionDistricts = useMemo(
    () => (activeRegionCityId ? getRegionChildren(activeRegionCityId) : []),
    [activeRegionCityId, getRegionChildren],
  );
  const regionNeighborhoods = useMemo(
    () => (activeRegionDistrictId ? getRegionChildren(activeRegionDistrictId) : []),
    [activeRegionDistrictId, getRegionChildren],
  );

  const patch = (next: Partial<RoomFormDraft>) => {
    setState((current) => ({
      ...current,
      draft: { ...current.draft, ...next },
    }));
  };
  const canSubmit = isRoomFormDraftValid(draft);
  const bottomPadding = useSafeBottomPadding(12, 12);

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
    regionCities,
    regionDistricts,
    regionNeighborhoods,
    activeRegionCityId,
    activeRegionDistrictId,
    setTitle: (next) => patch({ title: next }),
    setDeposit: (next) => patch({ deposit: next }),
    setRent: (next) => patch({ rent: next }),
    setMaintenance: (next) => patch({ maintenance: next }),
    selectRoomType: (next) => patch({ roomType: next }),
    selectRegionCity: (next) => {
      const firstDistrict = getRegionChildren(next)[0];
      setState((current) => ({
        ...current,
        activeRegionCityId: next,
        activeRegionDistrictId: firstDistrict?.id ?? null,
      }));
    },
    selectRegionDistrict: (next) => {
      const district = getRegionOption(next);
      const neighborhoods = getRegionChildren(next);
      setState((current) => ({
        ...current,
        activeRegionDistrictId: next,
        draft:
          neighborhoods.length === 0 && district
            ? { ...current.draft, regions: [district.region] }
            : current.draft,
      }));
    },
    selectRegion: (next) => patch({ regions: [next] }),
    setMoveInDate: (next) => patch({ moveInDate: next }),
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
    setDescription: (next) => patch({ description: next.slice(0, 500) }),
    reloadRoomTypes: roomTypeOptions.reload,
    reloadRoomOptions: roomAddOptions.reload,
    submit: () => {
      const values = draftToValues(draft);
      if (values) onSubmit(values);
    },
  };
}
