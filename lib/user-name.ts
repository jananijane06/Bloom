/**
 * Helper to extract a clean, human-friendly display name.
 * Prevents displaying raw email addresses in greetings or UI.
 */
export function extractCleanName(rawName?: string | null, email?: string | null): string {
  // 1. If a rawName is provided and does not look like an email address, use it.
  if (rawName && typeof rawName === 'string') {
    const trimmed = rawName.trim();
    if (trimmed && !trimmed.includes('@')) {
      return trimmed;
    }
    // If rawName was actually an email, treat it as email below
    if (trimmed && trimmed.includes('@')) {
      email = trimmed;
    }
  }

  // 2. If email is provided, parse a clean human-readable name from username part
  if (email && typeof email === 'string' && email.includes('@')) {
    const username = email.split('@')[0];
    const cleaned = username
      .replace(/[._\-+]+/g, ' ')
      .trim();

    if (cleaned) {
      return cleaned
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
  }

  return '';
}
