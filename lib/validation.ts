const OLD_NIC = /^[0-9]{9}[vVxX]$/;
const NEW_NIC = /^[0-9]{12}$/;

export function isValidSriLankaNic(nic: string): boolean {
  const trimmed = nic.trim();
  return OLD_NIC.test(trimmed) || NEW_NIC.test(trimmed);
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
