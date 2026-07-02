/** Languages commonly spoken by workers in Sri Lanka. */
export const WORKER_LANGUAGES = ['Sinhala', 'Tamil', 'English'] as const;

export type WorkerLanguage = (typeof WORKER_LANGUAGES)[number];

export const WORKER_LANGUAGE_META: Record<
  WorkerLanguage,
  { glyph: string; accent: string }
> = {
  Sinhala: { glyph: 'සි', accent: '#FFB800' },
  Tamil: { glyph: 'த', accent: '#E85D04' },
  English: { glyph: 'EN', accent: '#2563EB' },
};

export function formatLanguagesLabel(languages: string[] | undefined): string {
  if (!languages?.length) return 'Not set';
  return languages.join(', ');
}
