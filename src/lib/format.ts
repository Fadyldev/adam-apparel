export const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString('id-ID', options);
}

export function todayIso() {
  return new Date().toLocaleDateString('en-CA');
}

export function normalizeWa(input: string): string | null {
  const digits = input.replace(/[\s\-().+]/g, '');
  if (/^08\d{8,11}$/.test(digits)) return `62${digits.slice(1)}`;
  if (/^628\d{8,11}$/.test(digits)) return digits;
  return null;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
