export function formatSelectionLabel(name?: string | null, value?: string | null): string {
  const normalizedName = name?.trim();
  const normalizedValue = value?.trim();

  if (!normalizedName || normalizedName === '-') return normalizedValue || '-';
  if (!normalizedValue || normalizedValue === '-' || normalizedName === normalizedValue) {
    return normalizedName;
  }
  if (normalizedValue.startsWith(normalizedName)) return normalizedValue;

  return `${normalizedName} ${normalizedValue}`;
}
