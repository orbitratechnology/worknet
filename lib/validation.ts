/** Sri Lanka NIC: 9 digits + V/v, or 12 digits. */
export const SRI_LANKA_NIC_REGEX = /^([0-9]{9}[vV]|[0-9]{12})$/;

export function normalizeSriLankaNic(nic: string): string {
  const trimmed = nic.trim();
  if (/^[0-9]{9}[vV]$/.test(trimmed)) {
    return `${trimmed.slice(0, 9)}${trimmed[9].toUpperCase()}`;
  }
  return trimmed;
}

export function isValidSriLankaNic(nic: string): boolean {
  return SRI_LANKA_NIC_REGEX.test(nic.trim());
}

export function formatNicInput(value: string): string {
  const upper = value.toUpperCase();
  const cleaned = upper.replace(/[^0-9V]/g, '');
  if (cleaned.length <= 9) {
    return cleaned;
  }
  if (cleaned.length === 10 && cleaned.endsWith('V')) {
    return cleaned;
  }
  if (/^\d+$/.test(cleaned)) {
    return cleaned.slice(0, 12);
  }
  return cleaned.slice(0, 10);
}

export function nicValidationMessage(nic: string): string | null {
  const trimmed = nic.trim();
  if (!trimmed) return null;
  if (isValidSriLankaNic(trimmed)) return null;
  return 'Enter a valid NIC: 9 digits + V (e.g. 123456789V) or 12 digits.';
}

export function normalizePhoneE164(phone: string, countryCode = '+94'): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) {
    return `+${digits}`;
  }
  if (digits.startsWith('94')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `${countryCode}${digits.slice(1)}`;
  }
  return `${countryCode}${digits}`;
}

export function isValidE164Phone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 60;
}

export function isValidBio(bio: string): boolean {
  return bio.trim().length <= 500;
}
