import type { ImportantCondition, Region, RoomType, TermsAgreement } from './types';

export function agreedTermBackendIds(terms: TermsAgreement): number[] {
  const ids = Object.entries(terms).flatMap(([key, agreed]) => {
    const id = Number(key);
    return agreed && Number.isInteger(id) && id > 0 ? [id] : [];
  });
  return [...new Set(ids)];
}

export const REGIONS: Region[] = [
  { id: 'seoul-gangnam', city: '서울', district: '강남구' },
  { id: 'seoul-seocho', city: '서울', district: '서초구' },
  { id: 'seoul-mapo', city: '서울', district: '마포구' },
  { id: 'seoul-yongsan', city: '서울', district: '용산구' },
  { id: 'seoul-seongdong', city: '서울', district: '성동구' },
  { id: 'seoul-gwangjin', city: '서울', district: '광진구' },
  { id: 'seoul-jongno', city: '서울', district: '종로구' },
  { id: 'seoul-jung', city: '서울', district: '중구' },
  { id: 'seoul-songpa', city: '서울', district: '송파구' },
  { id: 'seoul-gangdong', city: '서울', district: '강동구' },
  { id: 'seoul-gangbuk', city: '서울', district: '강북구' },
  { id: 'seoul-nowon', city: '서울', district: '노원구' },
  { id: 'seoul-dongdaemun', city: '서울', district: '동대문구' },
  { id: 'seoul-seongbuk', city: '서울', district: '성북구' },
  { id: 'seoul-eunpyeong', city: '서울', district: '은평구' },
  { id: 'seoul-seodaemun', city: '서울', district: '서대문구' },
  { id: 'seoul-yangcheon', city: '서울', district: '양천구' },
  { id: 'seoul-gangseo', city: '서울', district: '강서구' },
  { id: 'seoul-guro', city: '서울', district: '구로구' },
  { id: 'seoul-yeongdeungpo', city: '서울', district: '영등포구' },
  { id: 'seoul-dongjak', city: '서울', district: '동작구' },
  { id: 'seoul-gwanak', city: '서울', district: '관악구' },
  { id: 'seoul-jungnang', city: '서울', district: '중랑구' },
  { id: 'seoul-dobong', city: '서울', district: '도봉구' },
  { id: 'seoul-geumcheon', city: '서울', district: '금천구' },
  { id: 'gg-seongnam', city: '경기', district: '성남시' },
  { id: 'gg-suwon', city: '경기', district: '수원시' },
  { id: 'gg-yongin', city: '경기', district: '용인시' },
  { id: 'gg-anyang', city: '경기', district: '안양시' },
  { id: 'gg-bucheon', city: '경기', district: '부천시' },
  { id: 'gg-goyang', city: '경기', district: '고양시' },
  { id: 'gg-namyangju', city: '경기', district: '남양주시' },
  { id: 'gg-hwaseong', city: '경기', district: '화성시' },
  { id: 'incheon-yeonsu', city: '인천', district: '연수구' },
  { id: 'incheon-bupyeong', city: '인천', district: '부평구' },
  { id: 'incheon-namdong', city: '인천', district: '남동구' },
];

export const IMPORTANT_CONDITIONS: ImportantCondition[] = [
  { id: 'no-smoking', label: '비흡연자' },
  { id: 'no-pet', label: '반려동물 없음' },
  { id: 'quiet', label: '조용한 환경' },
  { id: 'clean', label: '청결 유지' },
  { id: 'similar-schedule', label: '비슷한 생활패턴' },
  { id: 'no-visitor', label: '방문객 최소화' },
  { id: 'share-chores', label: '청소/가사 분담' },
  { id: 'separate-bath', label: '욕실 분리' },
  { id: 'female-only', label: '여성 전용' },
  { id: 'male-only', label: '남성 전용' },
  { id: 'student', label: '학생 우선' },
  { id: 'worker', label: '직장인 우선' },
  { id: 'long-term', label: '장기 거주' },
  { id: 'short-term', label: '단기 거주 가능' },
];

/**
 * 서버 GET /meta/room-types가 내려주는 5종과 동일하게 맞춘다(id 1~5 순서).
 * "전체"/쉐어하우스/빌라는 서버에 존재하지 않으므로 넣지 않는다.
 */
export const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'one-room', label: '원룸' },
  { value: 'two-room', label: '투룸' },
  { value: 'three-room+', label: '쓰리룸+' },
  { value: 'officetel', label: '오피스텔' },
  { value: 'apt', label: '아파트' },
];

export const BUDGET_BOUNDS = {
  min: 0,
  max: 200,
  step: 5,
};
