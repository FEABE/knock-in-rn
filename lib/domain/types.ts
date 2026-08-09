import type { Gender, Lifestyle, PreferredGender, Region, RoomType } from '@/lib/onboarding';

export type VerificationKind = 'school' | 'company';

export type VerificationBadge = {
  kind: VerificationKind;
  label: string;
  verifiedAt: Date;
};

export type ImportantCondition = {
  id?: string;
  name: string;
  value?: string;
  image?: string | null;
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

/**
 * 방 추가 옵션. 종류/이름이 서버 DB(/meta/room-add-options)에서만 정의되므로
 * 앱은 유니언 타입 대신 서버 id + name을 그대로 들고 다닌다.
 */
export type RoomOption = {
  /** 서버 room_add_option.id */
  id: number;
  /** 서버 name. 비어 있으면 메타 조회로 채운다. */
  name: string;
};

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
  moveInNegotiable?: boolean;
  status: RoomPostStatus;
  author: UserSummary;
  description: string;
  /** 게시글 상세의 동적 생활 패턴 항목 (백엔드 /meta/lifestyle-patterns 기준). 목록 응답에는 없음. */
  lifeStyles?: { id: string; name: string; value: string }[];
  options?: RoomOption[];
  liked?: boolean;
  compatibilityScore?: number;
  compatibilityDetails?: { label: string; score: number }[];
  listBadge?: 'hot';
  preferredRoommate?: {
    genderLabel?: string;
    smokingLabel?: string;
    smokingImage?: string | null;
    conditions: ImportantCondition[];
    importantConditions: (string | ImportantCondition)[];
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
  preferenceInfo: boolean;
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
  /** 요청 생성 시각. 서버 LocalDateTime(UTC) → parseServerDate 결과. */
  createdAt?: Date;
  /** 요청 상태가 마지막으로 바뀐 시각. */
  updatedAt?: Date;
};

export type ChatRoom = {
  id: string;
  peer: UserSummary;
  messages: ChatMessage[];
  matched: boolean;
  acceptedRequest: boolean;
  /** 상대방이 이미 다른 룸메이트와 매칭된 상태인지. */
  opponentHasRoommate: boolean;
  roommateRequest?: RoommateRequestState;
};
