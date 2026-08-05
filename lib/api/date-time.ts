/**
 * 백엔드의 LocalDateTime 필드에 맞는 오프셋 없는 ISO 문자열을 만든다.
 * Date#toISOString()은 Z를 붙이므로 comeEnableAt/comeableDate에 사용하면 400이 발생한다.
 */
export function formatApiLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
