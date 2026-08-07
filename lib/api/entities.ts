/**
 * 여러 도메인 응답에서 공통으로 등장하는 엔티티 타입.
 * 필드명은 모두 서버 명세를 그대로 따른다.
 */

/** 생활패턴 항목. profile / preferences / 게시글 상세 등에서 공통 사용. */
export type LifestyleItem = {
  lifestyleId: number;
  name: string;
  value: string;
  description: string;
  type: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
};

/** 선호조건(preferences) 항목. */
export type PreferenceItem = {
  preferencesId: number;
  name: string;
  value: string;
  description: string;
  type: 'SCALE' | 'BOOLEAN' | 'SINGLE_CHOICE';
  imageUrl?: string;
};

/** 조건(conditions) 항목. */
export type ConditionItem = {
  conditionsId: number;
  name: string;
};

/** 프로필 응답 내 지역 항목 (meta/regions 와 형태가 다름 — 명세 그대로). */
export type ProfileRegionItem = {
  regionId: number;
  region: string;
};

/** 방 프로필(roomProfile) 항목. */
export type RoomProfileItem = {
  roomProfileId: number;
  roomProfileName: string;
};

/** 궁합 정보. 게시글/매칭 상세, 궁합 점수 조회 등에서 공통 사용. */
export type Compatibility = {
  totalScore: number;
  lifeStyleInfo: {
    id?: number;
    name: string;
    percent: number;
  }[];
};
