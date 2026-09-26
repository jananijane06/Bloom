import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const nextParam = searchParams.get('next');

  // Prevent open redirect vulnerabilities by ensuring next is a relative path
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/today';

  const supabase = await createClient();

  // Handle PKCE authorization code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile row exists
      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.email?.split('@')[0] ||
        'Sanctuary Member';

      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            display_name: displayName,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      } catch {
        // Ignored if handled by trigger or already exists
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle token_hash / OTP verification (e.g. magic link, recovery, signup)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (!error && data.user) {
      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.email?.split('@')[0] ||
        'Sanctuary Member';

      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            display_name: displayName,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      } catch {
        // Ignored if handled by trigger or already exists
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login page with a friendly error code
  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
