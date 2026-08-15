/**
 * 아이콘 폰트(Ionicons 등)의 비대칭 세로 여백을 제거해 글리프가 박스 정중앙에 오도록 한다.
 * Android 기본 includeFontPadding 이 글리프 위쪽에 여백을 넣어 items-center 로도
 * 아이콘이 위로 치우쳐 보이는 문제를 없앤다. (하트/검색 아이콘, 칩 텍스트 공용)
 */
export const ICON_GLYPH_STYLE = {
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;
