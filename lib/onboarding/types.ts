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

export type RoomType = 'one-room' | 'two-room' | 'three-room+' | 'officetel' | 'share-house';

export type Region = {
  id: string;
  city: string;
  district: string;
};

export type ImportantCondition = {
  id: string;
  label: string;
};

export type TermKey =
  | 'terms-of-service'
  | 'privacy-policy'
  | 'marketing-push'
  | 'location';

export type Term = {
  key: TermKey;
  label: string;
  required: boolean;
  href?: string;
};

export type BasicProfile = {
  name: string;
  birthDate: Date | null;
  gender: Gender | null;
  preferredGender: PreferredGender | null;
  regions: Region[];
  bio: string;
  lifestyle: Partial<Lifestyle>;
  importantConditionIds: string[];
  dealbreaker: string;
  visibility: ProfileVisibility;
};

export type BudgetRange = {
  min: number;
  max: number;
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
  preferences: PreferenceConditions;
};

export function emptyBasicProfile(): BasicProfile {
  return {
    name: '',
    birthDate: null,
    gender: null,
    preferredGender: null,
    regions: [],
    bio: '',
    lifestyle: {},
    importantConditionIds: [],
    dealbreaker: '',
    visibility: 'public',
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

export function isLifestyleComplete(
  lifestyle: Partial<Lifestyle>,
): lifestyle is Lifestyle {
  return (
    !!lifestyle.sleepTime &&
    !!lifestyle.wakeTime &&
    lifestyle.cleanliness !== undefined &&
    lifestyle.noise !== undefined &&
    !!lifestyle.smoking &&
    !!lifestyle.pet
  );
}
