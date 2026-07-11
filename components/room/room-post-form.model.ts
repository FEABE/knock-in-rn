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
  imageUrls: string[];
  options: number[];
};

export const MAX_ROOM_PHOTOS = 10;

export type RoomFormDraft = {
  title: string;
  deposit: string;
  rent: string;
  maintenance: string;
  roomType: RoomType | null;
  regions: Region[];
  description: string;
  moveInDate: string;
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
    imageUris: [],
    options: [],
  };
}

export function isRoomFormDraftValid(draft: RoomFormDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    draft.deposit.trim().length > 0 &&
    Number(draft.deposit) >= 0 &&
    draft.rent.trim().length > 0 &&
    Number(draft.rent) > 0 &&
    draft.roomType !== null &&
    draft.regions.length > 0 &&
    draft.description.trim().length > 0 &&
    draft.description.length <= 500
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
    imageUrls: draft.imageUris.filter(Boolean).slice(0, MAX_ROOM_PHOTOS),
    options: draft.options,
  };
}

function parseDate(text: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return date;
}
