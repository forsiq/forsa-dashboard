import type { Merchant } from '../services/merchantsService';

export function merchantContactLine(
  merchant: Pick<Merchant, 'phone' | 'email' | 'username'>,
): string {
  const phone = merchant.phone?.trim();
  if (phone && phone !== '—') return phone;
  const email = merchant.email?.trim();
  if (email) return email;
  const username = merchant.username?.trim();
  if (username) return `@${username}`;
  return '—';
}
