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
