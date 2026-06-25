import type { RoomOption } from '@/lib/domain';
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
  options: RoomOption[];
  showProfileInfo: boolean;
};

export type RoomFormDraft = {
  title: string;
  deposit: string;
  rent: string;
  maintenance: string;
  roomType: RoomType | null;
  regions: Region[];
  description: string;
  moveInDate: string;
  options: RoomOption[];
  showProfileInfo: boolean;
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
    options: [],
    showProfileInfo: true,
  };
}

export function isRoomFormDraftValid(draft: RoomFormDraft): boolean {
  return (
    draft.title.trim().length > 0 &&
    Number(draft.deposit) >= 0 &&
    Number(draft.rent) > 0 &&
    draft.roomType !== null &&
    draft.regions.length > 0 &&
    draft.description.trim().length > 0
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
    options: draft.options,
    showProfileInfo: draft.showProfileInfo,
  };
}

function parseDate(text: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
