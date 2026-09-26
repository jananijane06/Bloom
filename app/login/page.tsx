'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/today';
  const urlError = searchParams.get('error');

  useEffect(() => {
    if (urlError) {
      setError(getFriendlyAuthErrorMessage(urlError));
    }
  }, [urlError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Empty field validation
    if (!email.trim()) {
      setError('Please enter your email address ');
      return;
    }
    if (!password) {
      setError('Please enter your password ');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(getFriendlyAuthErrorMessage(signInError));
        return;
      }

      if (data.user) {
        window.location.href = redirectTo;
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back "
      subtitle="Step back into your gentle space for focus and growth"
      badge="Bloom Sanctuary OS"
    >
      {error && <AuthMessage type="error" message={error} />}

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        {/* EMAIL */}
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          icon="mail"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@sanctuary.study"
          disabled={loading}
        />

        {/* PASSWORD */}
        <div>
          <PasswordInput
            id="password"
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={loading}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-primary/90 hover:text-primary hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="berry-button w-full rounded-full py-3.5 px-6 text-[13px] font-semibold text-white shadow-md transition duration-200 hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Entering sanctuary...</span>
              </>
            ) : (
              <>
                <span>Log in to Bloom</span>
                <span></span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* DIVIDER */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/70" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
          New here?
        </span>
        <div className="h-px flex-1 bg-white/70" />
      </div>

      {/* SIGNUP LINK */}
      <div className="text-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline transition"
        >
          <span>Don&apos;t have an account? Sign up</span>
          <span>→</span>
        </Link>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="sanctuary-bg relative min-h-screen flex items-center justify-center p-4">
          <div className="h-8 w-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
