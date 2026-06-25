export function numberValue(value: number | string | null | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function booleanValue(value: boolean | string | null | undefined): boolean {
  return value === true || value === 'true';
}

export function stringValue(value: number | string | null | undefined, fallback = '-'): string {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
}

export function formatDateLabel(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function definedLabels(values: (string | undefined)[]): string[] {
  return values.filter((value): value is string => !!value);
}
