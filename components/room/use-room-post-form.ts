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
  submit: () => void;
};

export function useRoomPostForm({
  initial,
  onSubmit,
  mode,
}: UseRoomPostFormProps): UseRoomPostFormReturn {
  const regions = useRegionOptions();
  const roomTypeOptions = useRoomTypeOptions();
  const roomAddOptions = useRoomAddOptionOptions(mode === 'edit');
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
    if (regions.cities.length === 0) return;
    setState((current) => {
      const selected = regions.getOption(current.draft.regions[0]?.id);
      const selectedParent = regions.getOption(selected?.parentId);
      const selectedGrandParent = regions.getOption(selectedParent?.parentId);
      const selectedCityId = selectedGrandParent?.id ?? selectedParent?.id ?? selected?.id;
      const selectedDistrictId = selectedGrandParent
        ? selectedParent?.id
        : selected?.parentId
          ? selected.id
          : null;
      const activeCityStillExists = regions.cities.some(
        (city) => city.id === current.activeRegionCityId,
      );
      const nextCityId = activeCityStillExists
        ? current.activeRegionCityId
        : (selectedCityId ?? regions.cities[0].id);
      const districts = regions.getChildren(nextCityId);
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
  }, [regions.cities, regions.getChildren, regions.getOption]);

  const regionDistricts = useMemo(
    () => (activeRegionCityId ? regions.getChildren(activeRegionCityId) : []),
    [activeRegionCityId, regions.getChildren],
  );
  const regionNeighborhoods = useMemo(
    () => (activeRegionDistrictId ? regions.getChildren(activeRegionDistrictId) : []),
    [activeRegionDistrictId, regions.getChildren],
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
    regionCities: regions.cities,
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
      const firstDistrict = regions.getChildren(next)[0];
      setState((current) => ({
        ...current,
        activeRegionCityId: next,
        activeRegionDistrictId: firstDistrict?.id ?? null,
      }));
    },
    selectRegionDistrict: (next) => {
      const district = regions.getOption(next);
      const neighborhoods = regions.getChildren(next);
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
      patch({
        options: draft.options.includes(next)
          ? draft.options.filter((option) => option !== next)
          : [...draft.options, next],
      });
    },
    setDescription: (next) => patch({ description: next.slice(0, 500) }),
    submit: () => {
      const values = draftToValues(draft);
      if (values) onSubmit(values);
    },
  };
}
