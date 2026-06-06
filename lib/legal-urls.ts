const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'worknet-orbitra';

/** Update after Firebase Hosting deploy if using a custom domain. */
const HOST_BASE = `https://${projectId}.web.app`;

export const LEGAL_URLS = {
  privacy: `${HOST_BASE}/privacy.html`,
  terms: `${HOST_BASE}/terms.html`,
  supportEmail: 'admin@orbitratech.net',
  supportMailto: 'mailto:admin@orbitratech.net',
} as const;
