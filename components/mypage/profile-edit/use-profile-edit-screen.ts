import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useState, type Dispatch, type SetStateAction } from 'react';

import type { RangeValue } from '@/components/ui/headless';
import { updateProfileLifestyle, updateProfileRoomInfo } from '@/lib/api';

export const PROFILE_SCALES = [
  {
    key: 'sleep',
    label: '취침 시간',
    min: '일찍 자요',
    max: '늦게 자요',
    levels: ['일찍(저녁)', '조금 일찍', '보통(자정)', '조금 늦게', '늦게(새벽)'],
  },
  {
    key: 'cleanliness',
    label: '청결 민감도',
    min: '신경 안 써요',
    max: '매우 청결해요',
    levels: ['신경 안 써요', '조금', '보통', '깔끔해요', '매우 청결해요'],
  },
  {
    key: 'noise',
    label: '소음 민감도',
    min: '둔감해요',
    max: '매우 민감해요',
    levels: ['둔감해요', '조금 둔감', '보통', '조금 민감', '매우 민감해요'],
  },
  {
    key: 'personality',
    label: '성격 스타일',
    min: '내향적',
    max: '외향적',
    levels: ['내향적', '조금 내향', '중간', '조금 외향', '외향적'],
  },
  {
    key: 'privacy',
    label: '개인 공간 중요도',
    min: '상관 없어요',
    max: '매우 중요해요',
    levels: ['상관 없어요', '조금', '보통', '중요해요', '매우 중요해요'],
  },
  {
    key: 'visitor',
    label: '방문객 빈도',
    min: '거의 없어요',
    max: '자주 있어요',
    levels: ['거의 없어요', '드물게', '가끔', '종종', '자주 있어요'],
  },
] as const;

export const PROFILE_ROOM_TYPES = [
  '원룸',
  '투룸',
  '쓰리룸 이상',
  '오피스텔',
  '쉐어하우스',
  '아파트',
  '빌라',
];

export type UseProfileEditScreenReturn = {
  scales: Record<string, number>;
  smoking: string | null;
  pet: string | null;
  hasRoom: boolean | null;
  deposit: RangeValue;
  rent: RangeValue;
  roomTypes: string[];
  setSmoking: (next: string) => void;
  setPet: (next: string) => void;
  setHasRoom: (next: boolean | null) => void;
  setDeposit: Dispatch<SetStateAction<RangeValue>>;
  setRent: Dispatch<SetStateAction<RangeValue>>;
  setRoomTypes: Dispatch<SetStateAction<string[]>>;
  setScale: (key: string, value: number) => void;
  onBack: () => void;
  saveLifestyle: () => Promise<void>;
  saveRoom: () => Promise<void>;
};

export function useProfileEditScreen(): UseProfileEditScreenReturn {
  const router = useRouter();
  const [scales, setScales] = useState<Record<string, number>>({});
  const [smoking, setSmoking] = useState<string | null>('no');
  const [pet, setPet] = useState<string | null>('no');
  const [hasRoom, setHasRoom] = useState<boolean | null>(false);
  const [deposit, setDeposit] = useState<RangeValue>([0, 500]);
  const [rent, setRent] = useState<RangeValue>([0, 50]);
  const [roomTypes, setRoomTypes] = useState<string[]>(['원룸']);
  const moveText = '2025.06.01';

  const saveLifestyle = async () => {
    const res = await updateProfileLifestyle({
      lifestyles: Object.entries(scales).map(([key, value]) => `${key}-${value}`),
    });
    Alert.alert(res.error ? '저장 실패' : '저장 완료');
  };

  const saveRoom = async () => {
    const res = await updateProfileRoomInfo({
      type: roomTypes[0] ?? '',
      minDeposit: String(deposit[0]),
      maxDeposit: String(deposit[1]),
      minMounthRent: String(rent[0]),
      maxMounthRent: String(rent[1]),
      comeEnableAt: moveText,
      region: [],
      roomProfile: roomTypes,
      deposit: '',
      mounthRent: '',
    });
    Alert.alert(res.error ? '저장 실패' : '저장 완료');
  };

  return {
    scales,
    smoking,
    pet,
    hasRoom,
    deposit,
    rent,
    roomTypes,
    setSmoking,
    setPet,
    setHasRoom,
    setDeposit,
    setRent,
    setRoomTypes,
    setScale: (key, value) => setScales((prev) => ({ ...prev, [key]: value })),
    onBack: () => router.back(),
    saveLifestyle,
    saveRoom,
  };
}
