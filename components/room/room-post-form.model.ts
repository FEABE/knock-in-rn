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

/** 서버 정책 policy.board.image-max-count=10. 초과해서 보내면 400이 떨어진다. */
export const MAX_ROOM_PHOTOS = 10;
export const MIN_ROOM_TITLE_LENGTH = 2;
export const MAX_ROOM_DESCRIPTION_LENGTH = 500;

/** 서버가 강제하는 보증금 상한(만원). 초과 시 400. */
export const MAX_ROOM_DEPOSIT = 2000;
/** 서버가 강제하는 월세 상한(만원). 초과 시 400. */
export const MAX_ROOM_MONTHLY_RENT = 500;

/** Intl 가용성에 의존하지 않는 천 단위 구분. */
function withThousandSeparator(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const MAX_ROOM_PHOTOS_MESSAGE = `사진은 최대 ${MAX_ROOM_PHOTOS}장까지 등록할 수 있어요`;
export const MAX_ROOM_DEPOSIT_MESSAGE = `보증금은 최대 ${withThousandSeparator(
  MAX_ROOM_DEPOSIT,
)}만원까지 입력 가능해요`;
export const MAX_ROOM_MONTHLY_RENT_MESSAGE = `월세는 최대 ${withThousandSeparator(
  MAX_ROOM_MONTHLY_RENT,
)}만원까지 입력 가능해요`;

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

/** 상한 초과 시 안내 문구, 아니면 null. 값이 비어 있으면 아직 안내하지 않는다. */
export function depositErrorMessage(draft: RoomFormDraft): string | null {
  const value = draft.deposit.trim();
  if (!value) return null;
  return Number(value) > MAX_ROOM_DEPOSIT ? MAX_ROOM_DEPOSIT_MESSAGE : null;
}

/** 상한 초과 시 안내 문구, 아니면 null. 값이 비어 있으면 아직 안내하지 않는다. */
export function monthlyRentErrorMessage(draft: RoomFormDraft): string | null {
  const value = draft.rent.trim();
  if (!value) return null;
  return Number(value) > MAX_ROOM_MONTHLY_RENT ? MAX_ROOM_MONTHLY_RENT_MESSAGE : null;
}

export function isBudgetSectionValid(draft: RoomFormDraft): boolean {
  return (
    draft.deposit.trim().length > 0 &&
    Number(draft.deposit) >= 0 &&
    Number(draft.deposit) <= MAX_ROOM_DEPOSIT &&
    draft.rent.trim().length > 0 &&
    Number(draft.rent) > 0 &&
    Number(draft.rent) <= MAX_ROOM_MONTHLY_RENT
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
    // 서버는 comeableDate를 필수로 받는다. 입주일 미선택 제출을 막는다.
    isMoveInSectionValid(draft) &&
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
