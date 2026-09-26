'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '@/components/auth/AuthCard';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthMessage } from '@/components/auth/AuthMessage';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If no session, user might not have arrived via a valid recovery callback
          setHasValidSession(false);
        }
      } catch {
        setHasValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter your new password ');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a password with at least 6 characters ');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical ');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(getFriendlyAuthErrorMessage(updateError));
        return;
      }

      setSuccess(true);

      // Smoothly navigate to /today after brief feedback
      setTimeout(() => {
        window.location.href = '/today';
      }, 2000);
    } catch (err: unknown) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="sanctuary-bg relative min-h-screen flex items-center justify-center p-4">
        <div className="h-8 w-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  if (!hasValidSession) {
    return (
      <AuthCard
        title="Session Expired"
        subtitle="This password reset link is invalid or has expired."
        badge="Bloom Sanctuary OS"
      >
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B85C7A]/10 text-[#B85C7A]">
            <span className="material-symbols-outlined text-[30px]">
              link_off
            </span>
          </div>

          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            For your security, password reset links can only be used once and expire quickly.
            Please request a fresh reset link to continue.
          </p>

          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="berry-button inline-flex items-center justify-center gap-2 rounded-full py-3 px-6 text-[12px] font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              <span>Request New Link</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a fresh password for your Bloom sanctuary."
      badge="Bloom Sanctuary OS"
    >
      {error && <AuthMessage type="error" message={error} />}

      {success ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              check_circle
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-on-surface">
              Password updated 
            </h2>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Your password has been securely updated. Redirecting you to your sanctuary...
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/today';
              }}
              className="berry-button inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-6 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
            >
              <span>Enter Sanctuary Now</span>
              <span>→</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
          {/* NEW PASSWORD */}
          <PasswordInput
            id="newPassword"
            label="New Password"
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
            id="confirmNewPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-type your new password"
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <span></span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* FOOTER LINK */}
      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-[12px] font-medium text-outline hover:text-primary transition"
        >
          Cancel and return to log in
        </Link>
      </div>
    </AuthCard>
  );
}
