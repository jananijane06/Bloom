'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required fields validation
    if (!displayName.trim()) {
      setError('Please enter your display name ');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address ');
      return;
    }
    if (!password) {
      setError('Please enter a password ');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a password with at least 6 characters for your sanctuary ');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical ');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
          emailRedirectTo: `${origin}/auth/callback?next=/today`,
        },
      });

      if (signUpError) {
        setError(getFriendlyAuthErrorMessage(signUpError));
        return;
      }

      // If email confirmation is disabled, user is immediately logged in
      if (data.session && data.user) {
        // Connect the user's profile
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              display_name: displayName.trim(),
            },
            { onConflict: 'id' }
          );
        } catch {
          // Handled by database trigger if RLS permits
        }

        window.location.href = '/today';
        return;
      }

      // If email confirmation is enabled, display the confirmation state
      if (data.user && !data.session) {
        setSuccessEmail(email.trim());
      }
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your Bloom"
      subtitle="Your little sanctuary starts here."
      badge="Bloom Sanctuary OS"
    >
      {error && <AuthMessage type="error" message={error} />}

      {successEmail ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              mark_email_read
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-on-surface">
              Check your email 
            </h2>
            <p className="text-[13px] text-on-surface-variant leading-relaxed max-w-sm mx-auto">
              We&apos;ve sent a gentle confirmation link to{' '}
              <strong className="text-primary font-semibold">{successEmail}</strong>.
              Click the link in the email to activate your account and step into Bloom.
            </p>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="berry-button inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              <span>Go to Log In</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
          {/* DISPLAY NAME */}
          <AuthInput
            id="displayName"
            label="Display Name"
            type="text"
            icon="person"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jane"
            disabled={loading}
          />

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
          <PasswordInput
            id="password"
            label="Password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            disabled={loading}
          />

          {/* CONFIRM PASSWORD */}
          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type your password"
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
                  <span>Creating sanctuary...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
          Already a member?
        </span>
        <div className="h-px flex-1 bg-white/70" />
      </div>

      {/* LOGIN LINK */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline transition"
        >
          <span>Already have an account? Log in</span>
          <span>→</span>
        </Link>
      </div>
    </AuthCard>
  );
}
