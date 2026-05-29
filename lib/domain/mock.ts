import { REGIONS } from '@/lib/onboarding';

import type {
  FaqItem,
  Inquiry,
  Notice,
  RoomPost,
  RoommateCard,
  UserSummary,
} from './types';

const region = (id: string) =>
  REGIONS.find((r) => r.id === id) ?? REGIONS[0];

export const MOCK_USERS: UserSummary[] = [
  {
    id: 'u-1',
    name: '지민',
    age: 26,
    gender: 'female',
    preferredGender: 'same',
    bio: '깔끔하고 조용한 룸메를 찾아요. 회사원이고 평일 늦게 퇴근해요.',
    region: region('seoul-mapo'),
    badges: [
      { kind: 'company', label: '회사 이메일 인증', verifiedAt: new Date() },
    ],
    lifestyle: {
      sleepTime: '24:00',
      wakeTime: '07:30',
      cleanliness: 4,
      noise: 4,
      smoking: 'no',
      pet: 'no',
    },
    importantConditions: ['quiet', 'clean'],
  },
  {
    id: 'u-2',
    name: '하준',
    age: 24,
    gender: 'male',
    preferredGender: 'same',
    bio: '대학원생입니다. 청결 신경쓰고 약속 잘 지킵니다.',
    region: region('seoul-seongdong'),
    badges: [
      { kind: 'school', label: '학교 이메일 인증', verifiedAt: new Date() },
    ],
    lifestyle: {
      sleepTime: '01:00',
      wakeTime: '08:30',
      cleanliness: 5,
      noise: 3,
      smoking: 'outdoor',
      pet: 'no',
    },
    importantConditions: ['clean', 'share-chores'],
  },
  {
    id: 'u-3',
    name: '수아',
    age: 28,
    gender: 'female',
    preferredGender: 'any',
    bio: '재택근무 위주. 조용하고 청결한 환경 선호.',
    region: region('seoul-gangnam'),
    badges: [],
    lifestyle: {
      sleepTime: '23:30',
      wakeTime: '08:00',
      cleanliness: 5,
      noise: 5,
      smoking: 'no',
      pet: 'small',
    },
    importantConditions: ['quiet', 'no-smoking', 'similar-schedule'],
  },
  {
    id: 'u-4',
    name: '도윤',
    age: 27,
    gender: 'male',
    preferredGender: 'any',
    bio: '직장인. 운동 좋아하고 깔끔합니다.',
    region: region('seoul-gwangjin'),
    badges: [
      { kind: 'company', label: '회사 이메일 인증', verifiedAt: new Date() },
    ],
    lifestyle: {
      sleepTime: '23:00',
      wakeTime: '06:30',
      cleanliness: 4,
      noise: 3,
      smoking: 'no',
      pet: 'no',
    },
    importantConditions: ['clean', 'similar-schedule'],
  },
  {
    id: 'u-5',
    name: '서윤',
    age: 25,
    gender: 'female',
    preferredGender: 'same',
    bio: '회사원, 평일에는 거의 집에 없어요. 주말 정리 좋아요.',
    region: region('gg-seongnam'),
    badges: [],
    lifestyle: {
      sleepTime: '00:30',
      wakeTime: '07:00',
      cleanliness: 3,
      noise: 3,
      smoking: 'no',
      pet: 'any',
    },
    importantConditions: ['no-visitor', 'clean'],
  },
];

export const MOCK_ROOM_POSTS: RoomPost[] = [
  {
    id: 'p-1',
    title: '망원 한강뷰 투룸 함께 살 룸메 구해요',
    deposit: 1500,
    monthlyRent: 80,
    maintenanceFee: 7,
    roomType: 'two-room',
    region: region('seoul-mapo'),
    views: 312,
    likes: 28,
    createdAt: new Date('2026-05-10'),
    moveInDate: new Date('2026-06-01'),
    status: 'open',
    author: MOCK_USERS[0],
    description:
      '한강 도보 5분, 햇볕 잘 들어요. 깨끗이 쓰시는 분 환영합니다.',
    thumbnailUrl: 'https://picsum.photos/seed/p1/600/400',
    photoUrls: [
      'https://picsum.photos/seed/p1/600/400',
      'https://picsum.photos/seed/p1b/600/400',
      'https://picsum.photos/seed/p1c/600/400',
    ],
    options: ['full-option', 'parking', 'elevator'],
  },
  {
    id: 'p-2',
    title: '강남 직주근접 오피스텔 룸셰어',
    deposit: 1000,
    monthlyRent: 95,
    roomType: 'officetel',
    region: region('seoul-gangnam'),
    views: 187,
    likes: 12,
    createdAt: new Date('2026-05-08'),
    status: 'open',
    author: MOCK_USERS[2],
    description:
      '2호선 도보 7분, 카드키. 야간 정숙 부탁드려요.',
    thumbnailUrl: 'https://picsum.photos/seed/p2/600/400',
  },
  {
    id: 'p-3',
    title: '성동구 신축 쓰리룸, 깔끔한 분 환영',
    deposit: 2000,
    monthlyRent: 110,
    roomType: 'three-room+',
    region: region('seoul-seongdong'),
    views: 421,
    likes: 41,
    createdAt: new Date('2026-05-12'),
    status: 'open',
    author: MOCK_USERS[1],
    description: '신축 입주, 분리 욕실 가능. 청결 매우 중요시합니다.',
    thumbnailUrl: 'https://picsum.photos/seed/p3/600/400',
  },
  {
    id: 'p-4',
    title: '광진구 원룸, 단기/장기 모두 OK',
    deposit: 500,
    monthlyRent: 55,
    roomType: 'one-room',
    region: region('seoul-gwangjin'),
    views: 95,
    likes: 7,
    createdAt: new Date('2026-05-13'),
    status: 'open',
    author: MOCK_USERS[3],
    description: '풀옵션, 즉시 입주 가능.',
    thumbnailUrl: 'https://picsum.photos/seed/p4/600/400',
  },
  {
    id: 'p-5',
    title: '판교 셰어하우스 1명 추가 모집',
    deposit: 800,
    monthlyRent: 70,
    roomType: 'share-house',
    region: region('gg-seongnam'),
    views: 256,
    likes: 19,
    createdAt: new Date('2026-05-11'),
    status: 'open',
    author: MOCK_USERS[4],
    description: '여성 셰어하우스, 거실 공용. 조용한 분 환영.',
    thumbnailUrl: 'https://picsum.photos/seed/p5/600/400',
  },
  {
    id: 'p-6',
    title: '연남 감성 투룸, 입주 가능 시기 조율',
    deposit: 1300,
    monthlyRent: 78,
    roomType: 'two-room',
    region: region('seoul-mapo'),
    views: 142,
    likes: 11,
    createdAt: new Date('2026-05-05'),
    status: 'open',
    author: MOCK_USERS[0],
    description: '연남동 카페거리 근처, 햇살 좋아요.',
    thumbnailUrl: 'https://picsum.photos/seed/p6/600/400',
  },
  {
    id: 'p-7',
    title: '성수 직장인 룸셰어',
    deposit: 1000,
    monthlyRent: 85,
    roomType: 'two-room',
    region: region('seoul-seongdong'),
    views: 73,
    likes: 4,
    createdAt: new Date('2026-05-14'),
    status: 'open',
    author: MOCK_USERS[1],
    description: '평일 거의 사무실, 주말도 외부일정 많음.',
    thumbnailUrl: 'https://picsum.photos/seed/p7/600/400',
  },
];

export const MOCK_ROOMMATE_CARDS: RoommateCard[] = MOCK_USERS.map((u, i) => ({
  id: `rc-${u.id}`,
  user: u,
  preferredRegions: [u.region],
  budgetMin: 40 + i * 5,
  budgetMax: 80 + i * 10,
  moveInBy: new Date(`2026-0${6 + (i % 3)}-01`),
  compatibilityScore: [82, 75, 91, 68, 88][i],
}));

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: '궁합 점수는 어떻게 산출되나요?',
    answer:
      '생활패턴(취침/기상, 청결/소음 민감도, 흡연/반려동물), 중요 조건, 딜브레이커 일치도를 기반으로 0~100점 사이 점수가 산출됩니다.',
  },
  {
    id: 'faq-2',
    question: '학교/회사 이메일 인증은 얼마나 걸리나요?',
    answer: '이메일로 발송된 인증코드를 입력하면 영업일 기준 1일 이내 완료됩니다.',
  },
  {
    id: 'faq-3',
    question: '매칭 후 분쟁이 생기면 어떻게 하나요?',
    answer:
      '공동생활 합의서 기반으로 협의를 권장합니다. 안전 사고/위협이 있는 경우 즉시 고객센터로 신고해주세요.',
  },
];

export const NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: '서비스 오픈 안내',
    body: '안녕하세요, 노크인이 정식 오픈했습니다.',
    createdAt: new Date('2026-04-15'),
  },
];

export const INQUIRIES: Inquiry[] = [
  {
    id: 'q-1',
    title: '프로필 사진 변경은 어떻게 하나요?',
    body: '프로필 변경에 사진이 보이지 않습니다.',
    answer: '마이페이지 > 내 프로필 카드 > 프로필 변경에서 변경하실 수 있어요.',
    answeredAt: new Date('2026-05-10'),
    createdAt: new Date('2026-05-08'),
    authorName: 'user1',
    isPublic: true,
  },
];

export const MOCK_SESSION_USER: UserSummary = MOCK_USERS[0];

import type { ChatRoom } from './types';

export const MOCK_CHAT_ROOMS: ChatRoom[] = MOCK_USERS.slice(1, 5).map((u) => ({
  id: u.id,
  peer: u,
  matched: false,
  acceptedRequest: false,
  messages: [
    {
      id: `${u.id}-sys`,
      authorId: 'system',
      body: '채팅이 시작되었어요. 인사를 건네보세요.',
      sentAt: new Date('2026-05-12T10:00:00'),
      kind: 'system',
    },
    {
      id: `${u.id}-m1`,
      authorId: u.id,
      body: `안녕하세요! ${u.name}입니다. 잘 부탁드려요 :)`,
      sentAt: new Date('2026-05-12T10:05:00'),
      kind: 'text',
    },
  ],
}));
