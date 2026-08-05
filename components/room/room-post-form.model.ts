import type { Region, RoomType } from '@/lib/onboarding';

export type RoomFormValues = {
  title: string;
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;
  roomType: RoomType;
  region: Region;
  description: string;
  moveInDate?: Date;
  moveInNegotiable?: boolean;
  imageUrls: string[];
  options: number[];
};

export const MAX_ROOM_PHOTOS = 20;
export const MIN_ROOM_TITLE_LENGTH = 2;
export const MAX_ROOM_DESCRIPTION_LENGTH = 500;

export type RoomFormDraft = {
  title: string;
  deposit: string;
  rent: string;
  maintenance: string;
  roomType: RoomType | null;
  regions: Region[];
  description: string;
  moveInDate: string;
  /** 입주일 협의 가능 여부. null이면 아직 미선택. */
  negotiable: boolean | null;
  imageUris: string[];
  options: number[];
};

export function emptyRoomFormDraft(): RoomFormDraft {
  return {
    title: '',
    deposit: '',
    rent: '',
    maintenance: '',
    roomType: null,
    regions: [],
    description: '',
    moveInDate: '',
    negotiable: null,
    imageUris: [],
    options: [],
  };
}

export function isRoomTitleLongEnough(draft: RoomFormDraft): boolean {
  return draft.title.trim().length >= MIN_ROOM_TITLE_LENGTH;
}

export function isBudgetSectionValid(draft: RoomFormDraft): boolean {
  return (
    draft.deposit.trim().length > 0 &&
    Number(draft.deposit) >= 0 &&
    draft.rent.trim().length > 0 &&
    Number(draft.rent) > 0
  );
}

export function isMoveInSectionValid(draft: RoomFormDraft): boolean {
  return parseDate(draft.moveInDate) !== undefined && draft.negotiable !== null;
}

export function isLocationSectionValid(draft: RoomFormDraft): boolean {
  return draft.regions.length > 0;
}

export function isRoomTypeSectionValid(draft: RoomFormDraft): boolean {
  return draft.roomType !== null;
}

export function isIntroSectionValid(draft: RoomFormDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    draft.description.trim().length > 0 &&
    draft.description.length <= MAX_ROOM_DESCRIPTION_LENGTH
  );
}

export function isRoomFormDraftValid(draft: RoomFormDraft): boolean {
  return (
    isRoomTitleLongEnough(draft) &&
    isBudgetSectionValid(draft) &&
    isRoomTypeSectionValid(draft) &&
    isLocationSectionValid(draft) &&
    isIntroSectionValid(draft)
  );
}

export function draftToValues(draft: RoomFormDraft): RoomFormValues | null {
  if (!isRoomFormDraftValid(draft) || draft.roomType === null) return null;
  return {
    title: draft.title.trim(),
    deposit: Number(draft.deposit) || 0,
    monthlyRent: Number(draft.rent),
    maintenanceFee: Number(draft.maintenance) || 0,
    roomType: draft.roomType,
    region: draft.regions[0],
    description: draft.description.trim(),
    moveInDate: parseDate(draft.moveInDate),
    moveInNegotiable: draft.negotiable ?? undefined,
    imageUrls: draft.imageUris.filter(Boolean).slice(0, MAX_ROOM_PHOTOS),
    options: draft.options,
  };
}

export function parseDate(text: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return date;
}

export function formatDraftDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
