import type { Gender, Lifestyle, PreferredGender, Region, RoomType } from '@/lib/onboarding';

export type VerificationKind = 'school' | 'company';

export type VerificationBadge = {
  kind: VerificationKind;
  label: string;
  verifiedAt: Date;
};

export type UserSummary = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  preferredGender: PreferredGender;
  bio: string;
  avatarUrl?: string;
  region: Region;
  badges: VerificationBadge[];
  lifestyle: Partial<Lifestyle>;
  importantConditions: string[];
  compatibilityScore?: number;
};

export type RoomPostStatus = 'open' | 'matched' | 'closed';

export type RoomOption = 'parking' | 'full-option' | 'elevator' | 'pet';

export type RoomPost = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  photoUrls?: string[];
  deposit: number;
  monthlyRent: number;
  maintenanceFee?: number;
  roomType: RoomType;
  region: Region;
  views: number;
  likes: number;
  createdAt: Date;
  moveInDate?: Date;
  status: RoomPostStatus;
  author: UserSummary;
  description: string;
  /** 게시글 상세의 동적 생활 패턴 항목 (백엔드 /meta/lifestyle-patterns 기준). 목록 응답에는 없음. */
  lifeStyles?: { id: string; name: string; value: string }[];
  options?: RoomOption[];
  liked?: boolean;
  compatibilityScore?: number;
  compatibilityDetails?: { label: string; score: number }[];
  preferredRoommate?: {
    genderLabel?: string;
    smokingLabel?: string;
    importantConditions: string[];
  };
};

export type RoommateCard = {
  id: string;
  user: UserSummary;
  preferredRegions: Region[];
  budgetMin?: number;
  budgetMax?: number;
  moveInBy?: Date;
  compatibilityScore?: number;
  liked?: boolean;
};

export type SortKey = 'latest' | 'likes' | 'views';

export type ListFilter = {
  rentMin?: number;
  rentMax?: number;
  gender?: Gender | 'any';
  regionIds?: string[];
  sort: SortKey;
};

export type Inquiry = {
  id: string;
  title: string;
  body: string;
  answer?: string;
  answeredAt?: Date;
  createdAt: Date;
  authorName: string;
  isPublic: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
};

export type Session = {
  user: UserSummary;
  isProfileComplete: boolean;
  visibility: 'public' | 'hidden' | 'matched';
} | null;

export type ChatMessage = {
  id: string;
  authorId: string;
  body: string;
  sentAt: Date;
  kind?: 'text' | 'image' | 'system';
  imageUrl?: string;
};

export type RoommateRequestState = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED' | 'EXPIRED';
  role: 'requester' | 'requestee' | 'unknown';
};

export type ChatRoom = {
  id: string;
  peer: UserSummary;
  messages: ChatMessage[];
  matched: boolean;
  acceptedRequest: boolean;
  roommateRequest?: RoommateRequestState;
};
