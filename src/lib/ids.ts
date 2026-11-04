export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseWholeNumber(value: string): number | null {
  const parsed = Number(value.replace(/\./g, '').replace(/,/g, '.'));
  return value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}
