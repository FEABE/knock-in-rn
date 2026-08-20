export type Gender = 'male' | 'female' | 'other';

export const PROFILE_NAME_MIN_LENGTH = 2;
export const PROFILE_NAME_MAX_LENGTH = 10;
// 이메일 입력을 다시 도입할 때 함께 복구한다.
// export const PROFILE_EMAIL_PATTERN =
//   /^[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*@[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(?:\.[A-Za-z]{2,})+$/;

export function isValidProfileName(value: string): boolean {
  const name = value.trim();
  return (
    name.length >= PROFILE_NAME_MIN_LENGTH &&
    name.length <= PROFILE_NAME_MAX_LENGTH &&
    /^[가-힣]+$/.test(name)
  );
}

// export function isValidProfileEmail(value: string): boolean {
//   return PROFILE_EMAIL_PATTERN.test(value.trim());
// }

export type PreferredGender = 'same' | 'any';

export type CleanlinessLevel = 1 | 2 | 3 | 4 | 5;
export type NoiseSensitivity = 1 | 2 | 3 | 4 | 5;

export type Smoking = string;
export type PetPolicy = string;

export type Lifestyle = {
  sleepTime: string;
  wakeTime: string;
  cleanliness: CleanlinessLevel;
  noise: NoiseSensitivity;
  smoking: Smoking;
  pet: PetPolicy;
};

export type RoomType = string;

export type Region = {
  id: string;
  city: string;
  district: string;
};

export type ImportantCondition = {
  id: string;
  label: string;
};

export type TermKey = string;

export type Term = {
  key: TermKey;
  label: string;
  required: boolean;
  href?: string;
};

/** Swagger /meta/lifestyle-patterns 의 SCALE 패턴 key. */
export type LifestyleScaleKey = string;

export type LifestyleScales = Partial<Record<LifestyleScaleKey, number>>;

export type BasicProfile = {
  name: string;
  birthDate: Date | null;
  gender: Gender | null;
  // email: string; // 온보딩 이메일 수집 정책으로 임시 비활성화
  preferredGender: PreferredGender | null;
  regions: Region[];
  bio: string;
  lifestyle: Partial<Lifestyle>;
  scales: LifestyleScales;
  lifestyleChoices: Record<string, string>;
  importantConditionIds: string[];
  dealbreaker: string;
};

export type BudgetRange = {
  min: number;
  max: number;
};

/**
 * 와이어프레임 "방 유무 여부 / 조건 입력" 스텝.
 *
 * 방있음/방없음은 입력 형태가 달라(단일 vs 복수·범위) 필드를 분리해 둔다.
 * 전환해도 각 케이스 입력값이 보존되며, 저장 시 hasRoom 기준으로 해당 필드만 보낸다.
 */
export type RoomCondition = {
  /** 방 있어요(true) / 방 없어요(false) */
  hasRoom: boolean | null;

  // ── 방 있어요 (단일 입력) ──
  region: Region | null;
  /** 보증금(만원). 0 허용, 미입력은 null. */
  deposit: number | null;
  /** 월세(만원). 0 허용, 미입력은 null. */
  monthlyRent: number | null;
  roomType: RoomType | null;
  moveInDate: Date | null;

  // ── 방 없어요 (범위·복수) ──
  /** 선호 지역 복수 선택. 구까지만도 OK, 미선택(선택사항) 가능. */
  regions: Region[];
  /** 예산 보증금 범위 (0~2000만원). */
  budgetDeposit: BudgetRange;
  /** 예산 월세 범위 (0~500만원). */
  budgetRent: BudgetRange;
  /** 예산 관리비 범위 (0~150만원). */
  budgetManagement: BudgetRange;
  /** 선호 방 형태 복수 선택 (최대 3개). */
  roomTypes: RoomType[];
  moveInBy: Date | null;
};

export const MAX_ROOM_CONDITION_DEPOSIT = 2000;
export const MAX_ROOM_CONDITION_REGIONS = 10;

export type PreferenceConditions = {
  budget: BudgetRange | null;
  moveInBy: Date | null;
  roomTypes: RoomType[];
  /** 룸메이트 선호 생활패턴 카테고리별 선택값. 숫자는 서버 lifestyle 상세 ID다. */
  lifestyleSelections: Record<string, number | 'any'>;
};

export type TermsAgreement = Record<string, boolean>;

export type OnboardingValues = {
  terms: TermsAgreement;
  profile: BasicProfile;
  room: RoomCondition;
  preferences: PreferenceConditions;
};

export function emptyBasicProfile(): BasicProfile {
  return {
    name: '',
    birthDate: null,
    gender: null,
    // email: '',
    preferredGender: null,
    regions: [],
    bio: '',
    lifestyle: {},
    scales: {},
    lifestyleChoices: {},
    importantConditionIds: [],
    dealbreaker: '',
  };
}

export function emptyRoomCondition(): RoomCondition {
  return {
    hasRoom: null,
    region: null,
    deposit: null,
    monthlyRent: null,
    roomType: null,
    moveInDate: null,
    regions: [],
    budgetDeposit: { min: 0, max: MAX_ROOM_CONDITION_DEPOSIT },
    budgetRent: { min: 0, max: 500 },
    budgetManagement: { min: 0, max: 150 },
    roomTypes: [],
    moveInBy: null,
  };
}

export function emptyPreferenceConditions(): PreferenceConditions {
  return {
    budget: null,
    moveInBy: null,
    roomTypes: [],
    lifestyleSelections: {},
  };
}

export function isBasicProfileComplete(profile: BasicProfile): boolean {
  return (
    isValidProfileName(profile.name) &&
    // isValidProfileEmail(profile.email) &&
    profile.birthDate !== null &&
    profile.gender !== null &&
    profile.regions.length > 0 &&
    profile.bio.trim().length > 0 &&
    isLifestyleComplete(profile.lifestyle) &&
    profile.dealbreaker.trim().length > 0
  );
}

export function isLifestyleComplete(lifestyle: Partial<Lifestyle>): lifestyle is Lifestyle {
  return (
    !!lifestyle.sleepTime &&
    !!lifestyle.wakeTime &&
    lifestyle.cleanliness !== undefined &&
    lifestyle.noise !== undefined &&
    !!lifestyle.smoking &&
    !!lifestyle.pet
  );
}
