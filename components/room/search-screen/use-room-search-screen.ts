import { useRouter } from 'expo-router';
import { useState } from 'react';

const INITIAL_RECENT = [
  '마포구 원룸',
  '서대문구 즉시입주',
  '신촌 쉐어하우스',
  '홍대 비흡연',
  '강남역 오피스텔',
  '연남동 빌라 여성만',
  '풀옵션 투룸',
];

export const POPULAR_ROOM_SEARCH_TERMS = [
  '즉시입주',
  '마포구 원룸',
  '서대문구',
  '쉐어하우스',
  '풀옵션',
  '비흡연',
  '여성만',
  '홍대 근처',
];

export type UseRoomSearchScreenReturn = {
  query: string;
  recent: string[];
  popular: string[];
  setQuery: (next: string) => void;
  clearQuery: () => void;
  clearRecent: () => void;
  removeRecent: (term: string) => void;
  submit: (term: string) => void;
  onCancel: () => void;
};

export function useRoomSearchScreen(): UseRoomSearchScreenReturn {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT);

  const submit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 20));
    router.back();
  };

  return {
    query,
    recent,
    popular: POPULAR_ROOM_SEARCH_TERMS,
    setQuery,
    clearQuery: () => setQuery(''),
    clearRecent: () => setRecent([]),
    removeRecent: (term) => setRecent((prev) => prev.filter((item) => item !== term)),
    submit,
    onCancel: () => router.back(),
  };
}
