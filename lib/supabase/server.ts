import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Profile } from "@/types/database";
import { getSupabaseProjectInfo } from "@/lib/supabase/projectInfo";

export async function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies.
        }
      },
    },
  });
}

/**
 * Server helper to get current authenticated user
 */
export async function getCurrentUser(accessToken?: string) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (process.env.NODE_ENV === 'development') {
      const safeAuthErrorMessage = error?.message
        ?.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
        ?.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted]')
        ?.slice(0, 240) ?? null;
      console.info('[supabase-user-verification-diagnostic]', {
        ...getSupabaseProjectInfo(),
        explicitAccessTokenProvided: Boolean(accessToken),
        userResolved: Boolean(user),
        userIdExists: Boolean(user?.id),
        authRequestSucceeded: !error && Boolean(user),
        authErrorCode: error?.code ?? null,
        authErrorStatus: error?.status ?? null,
        authErrorMessage: safeAuthErrorMessage,
      });
    }

    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      const message = error instanceof Error
        ? error.message.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]').slice(0, 240)
        : 'Unknown auth verification exception.';
      console.info('[supabase-user-verification-diagnostic]', {
        ...getSupabaseProjectInfo(),
        explicitAccessTokenProvided: Boolean(accessToken),
        userResolved: false,
        userIdExists: false,
        authRequestSucceeded: false,
        authErrorCode: null,
        authErrorStatus: null,
        authErrorMessage: message,
      });
    }
    return null;
  }
}

/**
 * Server helper to get profile of the currently authenticated user
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return null;
    }
    return profile as Profile;
  } catch {
    return null;
  }
}
