/**
 * 신고하기 화면의 신고 유형 옵션.
 * Figma 신고 유형 선택 시트(3393:50963) 라디오 5종과 동일한 문구를 사용한다.
 */
export const REPORT_TYPE_OPTIONS = [
  '부적절한 콘텐츠에요',
  '허위 정보가 포함됐어요',
  '욕설 및 비방이 포함됐어요',
  '사기가 의심돼요',
  '기타',
] as const;

export type ReportTypeOption = (typeof REPORT_TYPE_OPTIONS)[number];
