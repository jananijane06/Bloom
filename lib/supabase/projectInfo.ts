/** Safe project identity for diagnostics; never returns a Supabase key. */
export function getSupabaseProjectInfo() {
  const configuredUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '');

  try {
    const hostname = new URL(configuredUrl).hostname;
    return { hostname, projectReference: hostname.split('.')[0] || 'unknown' };
  } catch {
    return { hostname: 'invalid-url', projectReference: 'unknown' };
  }
}
