/**
 * 백엔드의 LocalDateTime 필드에 맞는 오프셋 없는 ISO 문자열을 만든다.
 * Date#toISOString()은 Z를 붙이므로 comeEnableAt/comeableDate에 사용하면 400이 발생한다.
 *
 * 서버 LocalDateTime = UTC 벽시계다. 백엔드 JVM이 UTC로 뜨기 때문에
 * 오프셋 없는 문자열은 그대로 UTC 시각으로 해석·저장되고, 조회 시에도 UTC 벽시계로 내려온다
 * (parseServerDate가 접미사 'Z'를 붙여 파싱하는 근거와 동일하다).
 * 따라서 기기 로컬 벽시계를 그대로 보내면 KST 기준 9시간이 밀린 값이 저장된다.
 * 반드시 UTC 컴포넌트(getUTC*)로 직렬화한다.
 */
export function formatApiLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

/**
 * '캘린더 날짜' 의미(입주일 등)를 가진 로컬 자정 Date를 같은 날짜의 UTC 자정으로 옮긴다.
 * 서버 LocalDateTime이 UTC 벽시계이므로, 이 변환 없이 보내면 KST 기준 하루가 밀린다
 * (2026-08-10 00:00 KST → 2026-08-09T15:00 저장).
 */
export function localCalendarDateToUtc(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/** 캘린더 날짜(로컬 자정)를 서버 LocalDateTime 문자열로 직렬화한다. 결과는 항상 T00:00:00. */
export function formatApiCalendarDate(date: Date): string {
  return formatApiLocalDateTime(localCalendarDateToUtc(date));
}

/**
 * 서버가 UTC 자정으로 저장한 캘린더 날짜를 기기 로컬 자정 Date로 되돌린다.
 * 폼 프리필/캘린더 위젯은 로컬 컴포넌트(getFullYear 등)를 쓰므로,
 * 이 변환을 거쳐야 기기 시간대와 무관하게 같은 날짜가 보인다.
 */
export function serverCalendarDateToLocal(date: Date): Date {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 서버가 내려주는 LocalDateTime 문자열("2026-08-05T05:30:00", 오프셋 없음)은
 * UTC 벽시계다. 오프셋 없이 new Date()에 넘기면 기기 로컬 시간으로 해석되므로
 * 반드시 이 함수로 파싱한다. 서버가 KST 벽시계를 주는 것으로 확인되면
 * 아래 접미사를 '+09:00'으로 바꾸면 된다.
 */
const SERVER_LOCAL_DATETIME_SUFFIX = 'Z';

export function parseServerDate(value?: string | null): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const dateOnly = !raw.includes('T');
  const normalized = hasOffset || dateOnly ? raw : `${raw}${SERVER_LOCAL_DATETIME_SUFFIX}`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export interface KstClock {
  year: number;
  /** 1~12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/** 기기 시간대와 무관하게 해당 시각의 KST 벽시계 값을 돌려준다. */
export function kstClock(date: Date): KstClock {
  const d = new Date(date.getTime() + KST_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

export function isSameKstDay(a: Date, b: Date): boolean {
  const ca = kstClock(a);
  const cb = kstClock(b);
  return ca.year === cb.year && ca.month === cb.month && ca.day === cb.day;
}

const pad2 = (value: number) => String(value).padStart(2, '0');

/** "오전 8:05" — 채팅 말풍선용 KST 시각. */
export function formatKstTime(date: Date): string {
  const { hour, minute } = kstClock(date);
  const period = hour < 12 ? '오전' : '오후';
  const h = hour % 12 || 12;
  return `${period} ${h}:${pad2(minute)}`;
}

/** "2026.08.05" — KST 기준 날짜 라벨. */
export function formatKstDateLabel(date: Date): string {
  const { year, month, day } = kstClock(date);
  return `${year}.${pad2(month)}.${pad2(day)}`;
}

/** "2026.08.05 14:05" — KST 기준 날짜+시각 라벨. */
export function formatKstDateTimeLabel(date: Date): string {
  const { hour, minute } = kstClock(date);
  return `${formatKstDateLabel(date)} ${pad2(hour)}:${pad2(minute)}`;
}
