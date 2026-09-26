'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address ');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        }
      );

      if (resetError) {
        setError(getFriendlyAuthErrorMessage(resetError));
        return;
      }

      setSentEmail(email.trim());
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="We'll send a gentle link to guide you back into Bloom"
      badge="Bloom Sanctuary OS"
    >
      {error && <AuthMessage type="error" message={error} />}

      {sentEmail ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              mark_email_read
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-on-surface">
              Reset link sent 
            </h2>
            <p className="text-[13px] text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              We&apos;ve sent a password reset link to{' '}
              <strong className="text-primary font-semibold">{sentEmail}</strong>.
              Click the link in the email to set a new password.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/login"
              className="berry-button inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              <span>Back to Log In</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4" noValidate>
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
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <span></span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* DIVIDER */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/70" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
          Remember your password?
        </span>
        <div className="h-px flex-1 bg-white/70" />
      </div>

      {/* LOGIN LINK */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline transition"
        >
          <span>Return to log in</span>
          <span>→</span>
        </Link>
      </div>
    </AuthCard>
  );
}
