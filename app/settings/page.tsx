'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { User, Palette, Database, Check, Shield } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { extractCleanName } from '@/lib/user-name';

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [mantra, setMantra] = useState('Breathe, focus, blossom.');
  const [savedAlert, setSavedAlert] = useState(false);
  const [saving, setSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(true);

  useEffect(() => {
    if (profile?.display_name) {
      setName(extractCleanName(profile.display_name));
    } else if (user?.user_metadata?.display_name) {
      setName(extractCleanName(user.user_metadata.display_name));
    } else if (user?.email) {
      setName(extractCleanName(null, user.email));
    } else {
      try {
        const stored = localStorage.getItem('bloom_user_name');
        if (stored) setName(stored);
      } catch {
        // Ignore
      }
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      try {
        localStorage.setItem('bloom_user_name', name.trim());
      } catch {
        // Ignore
      }
      if (user) {
        const supabase = createClient();
        await supabase.from('profiles').upsert({
          id: user.id,
          display_name: name.trim(),
        });
        await refreshProfile();
      }
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: { name, mantra, email: user?.email },
      exportedAt: new Date().toISOString(),
      note: 'Bloom Sanctuary OS backup data',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-4xl space-y-8">
          <div>
            <p className="editorial-label mb-2 text-primary">A FEW PERSONAL PREFERENCES</p>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              preferences
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Make Bloom feel like your own.
            </p>
          </div>

          {savedAlert && (
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-primary" />
              Profile and settings saved successfully!
            </div>
          )}

          {/* Profile Section */}
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Mindful Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || 'Guest Sanctuary User'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/40 border border-white/60 text-sm text-outline cursor-not-allowed select-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1.5">
                    Daily Focus Mantra
                  </label>
                  <input
                    type="text"
                    value={mantra}
                    onChange={(e) => setMantra(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 border border-white/90 text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Account & Security Section */}
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Security & Row Level Security
            </h2>
            <div className="space-y-2 text-xs text-on-surface-variant">
              {user ? (
                <>
                  <p>
                    • Authenticated with Supabase Auth: <strong className="text-on-surface">{user.email}</strong>
                  </p>
                  <p>
                    • User UUID: <code className="bg-white/60 px-2 py-0.5 rounded text-[11px] font-mono text-primary">{user.id}</code>
                  </p>
                  <p>
                    • Row Level Security (RLS) is enabled. Only your authenticated user account can access or modify your personal data.
                  </p>
                  <div className="pt-3 border-t border-white/60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Sign Out</p>
                      <p className="text-xs text-on-surface-variant">Log out of your sanctuary session on this device.</p>
                    </div>
                    <button
                      type="button"
                      onClick={signOut}
                      className="px-4 py-2 rounded-full border border-[#B85C7A]/30 bg-[#B85C7A]/10 text-[#B85C7A] hover:bg-[#B85C7A]/20 text-xs font-semibold transition"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    • Mode: <strong className="text-on-surface">Guest Sanctuary (No sign-in required)</strong>
                  </p>
                  <p>
                    • You can use Bloom freely without signing in. You can also log in or sign up anytime to back up and sync your sanctuary across devices.
                  </p>
                  <div className="pt-3 border-t border-white/60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Join or Sign In</p>
                      <p className="text-xs text-on-surface-variant">Optional: Sync your sanctuary to Supabase cloud.</p>
                    </div>
                    <Link
                      href="/login"
                      className="berry-button px-4 py-2 rounded-full text-white text-xs font-semibold shadow-sm transition hover:shadow-md"
                    >
                      Log In / Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Ambiance & Experience */}
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Ambiance & Aesthetics
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/60">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Ambient Glow Mesh
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Render calm, blurred berry and peach gradients in the background.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={ambientGlow}
                  onChange={(e) => setAmbientGlow(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#5A1835] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    Soft Soundscapes & Chimes
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Play gentle singing-bowl chimes when completing tasks or reflections.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#5A1835] cursor-pointer"
                />
              </div>
            </div>
          </GlassCard>

          {/* Data & Privacy */}
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Data Ownership & Privacy
            </h2>

            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Bloom respects your sanctuary. All reflections and records are secured in Supabase with user-scoped Row Level Security policies.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="glass" size="sm" onClick={handleExportData}>
                Export My Data (JSON)
              </Button>
            </div>
          </GlassCard>

          {/* About */}
          <div className="text-center py-6 text-xs text-outline">
            <p className="font-semibold text-on-surface">
              Bloom — Sanctuary OS v1.0.0
            </p>
            <p className="mt-1">Crafted with care, serenity, Next.js App Router, and Supabase.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
