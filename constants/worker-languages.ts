/** Languages commonly spoken by workers in Sri Lanka. */
export const WORKER_LANGUAGES = ['Sinhala', 'Tamil', 'English'] as const;

export type WorkerLanguage = (typeof WORKER_LANGUAGES)[number];

export function formatLanguagesLabel(languages: string[] | undefined): string {
  if (!languages?.length) return 'Not set';
  return languages.join(', ');
}
