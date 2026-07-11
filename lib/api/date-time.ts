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
