export type Gender = 'male' | 'female' | 'other';

export type PreferredGender = 'same' | 'any';

export type CleanlinessLevel = 1 | 2 | 3 | 4 | 5;
export type NoiseSensitivity = 1 | 2 | 3 | 4 | 5;

export type Smoking = 'no' | 'outdoor' | 'yes';
export type PetPolicy = 'no' | 'small' | 'any';

export type Lifestyle = {
  sleepTime: string;
  wakeTime: string;
  cleanliness: CleanlinessLevel;
  noise: NoiseSensitivity;
  smoking: Smoking;
  pet: PetPolicy;
};

export type ProfileVisibility = 'public' | 'hidden' | 'matched';

export type RoomType =
  | 'one-room'
  | 'two-room'
  | 'three-room+'
  | 'officetel'
  | 'share-house'
  | 'apt'
  | 'villa';

export type Region = {
  id: string;
  city: string;
  district: string;
};

export type ImportantCondition = {
  id: string;
  label: string;
};

export type TermKey = 'terms-of-service' | 'privacy-policy' | 'marketing-push' | 'location';

export type Term = {
  key: TermKey;
  label: string;
  required: boolean;
  href?: string;
};

/**
 * 와이어프레임 "생활 패턴" 스텝의 6개 척도(1~5).
 * 기존 Lifestyle 타입과 별개로 온보딩 슬라이더 응답을 담는다.
 */
export type LifestyleScaleKey =
  | 'sleep'
  | 'cleanliness'
  | 'noise'
  | 'personality'
  | 'privacy'
  | 'visitor';

export type LifestyleScales = Partial<Record<LifestyleScaleKey, number>>;

export type BasicProfile = {
  name: string;
  birthDate: Date | null;
  gender: Gender | null;
  email: string;
  preferredGender: PreferredGender | null;
  regions: Region[];
  bio: string;
  lifestyle: Partial<Lifestyle>;
  scales: LifestyleScales;
  importantConditionIds: string[];
  dealbreaker: string;
  visibility: ProfileVisibility;
};

export type BudgetRange = {
  min: number;
  max: number;
};

/**
 * 와이어프레임 "방 유무 여부 / 조건 입력" 스텝.
 */
export type RoomCondition = {
  /** 방 있어요(true) / 방 없어요(false) */
  hasRoom: boolean | null;
  region: Region | null;
  deposit: BudgetRange;
  monthlyRent: BudgetRange;
  managementCost: BudgetRange;
  roomType: RoomType | null;
  moveInDate: Date | null;
};

export type PreferenceConditions = {
  budget: BudgetRange | null;
  moveInBy: Date | null;
  roomTypes: RoomType[];
};

export type TermsAgreement = Record<TermKey, boolean>;

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
    email: '',
    preferredGender: null,
    regions: [],
    bio: '',
    lifestyle: {},
    scales: {},
    importantConditionIds: [],
    dealbreaker: '',
    visibility: 'public',
  };
}

export function emptyRoomCondition(): RoomCondition {
  return {
    hasRoom: null,
    region: null,
    deposit: { min: 0, max: 1000 },
    monthlyRent: { min: 0, max: 30 },
    managementCost: { min: 0, max: 30 },
    roomType: null,
    moveInDate: null,
  };
}

export function emptyPreferenceConditions(): PreferenceConditions {
  return {
    budget: null,
    moveInBy: null,
    roomTypes: [],
  };
}

export function isBasicProfileComplete(profile: BasicProfile): boolean {
  return (
    profile.name.trim().length > 0 &&
    profile.birthDate !== null &&
    profile.gender !== null &&
    profile.preferredGender !== null &&
    profile.regions.length > 0 &&
    profile.bio.trim().length > 0 &&
    isLifestyleComplete(profile.lifestyle) &&
    profile.importantConditionIds.length > 0 &&
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
