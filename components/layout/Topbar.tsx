"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { extractCleanName } from "@/lib/user-name";

export interface TopbarProps {
  onToggleSidebar?: () => void;
  onQuickAddTask?: () => void;
}

export function Topbar({ onToggleSidebar, onQuickAddTask }: TopbarProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("Friday, 25 September 2026");

  const displayName = extractCleanName(
    profile?.display_name || user?.user_metadata?.display_name,
    user?.email
  );

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (formatted) setCurrentDate(formatted);
  }, []);

  const handleAction = (type: string) => {
    setQuickAddOpen(false);
    switch (type) {
      case "New Task":
        if (onQuickAddTask) onQuickAddTask();
        else router.push("/tasks");
        break;
      case "New Event":
        router.push("/calendar");
        break;
      case "New Journal Entry":
        router.push("/journal");
        break;
      case "Log Mood":
        router.push("/mood");
        break;
      case "Ask Bloom AI":
        router.push("/bloom-ai");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <header className="fixed left-0 lg:left-[250px] right-0 top-0 z-40 h-16 border-b border-white/60 bg-white/40 shadow-[0_2px_15px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
        <div className="flex h-16 w-full min-w-0 items-center justify-between gap-2 px-3 sm:px-8">
          {/* LEFT: MOBILE TOGGLE & DATE */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Toggle navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/55 text-stone-700 shadow-sm transition hover:bg-white lg:hidden"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            )}

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white/60 text-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_today
                </span>
              </div>

              <span className="typewriter min-w-0 truncate text-[11px] text-on-surface sm:text-[13px]">
                {currentDate}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* SEARCH */}
            <div className="relative hidden md:flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-outline">
                search
              </span>

              <input
                type="text"
                placeholder="Search sanctuary..."
                className="w-48 lg:w-64 rounded-full border border-white/80 bg-white/50 py-2 pl-10 pr-4 text-[13px] text-on-surface shadow-sm outline-none transition-all placeholder:text-outline/70 focus:bg-white/80 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* SETTINGS */}
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/55 text-stone-700 shadow-sm transition hover:bg-white"
            >
              <span className="material-symbols-outlined text-[19px]">
                settings
              </span>
            </Link>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/55 text-stone-700 shadow-sm transition hover:bg-white"
              >
                <span className="material-symbols-outlined text-[19px]">
                  notifications
                </span>

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
              </button>

              {notificationsOpen && (
                <div className="fixed sm:absolute right-4 sm:right-0 top-[72px] sm:top-12 z-50 w-72 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur-3xl animate-in fade-in zoom-in-95 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/70 mb-2 font-bold text-on-surface">
                    <span>Sanctuary Alerts</span>
                    <span className="text-[10px] text-primary font-semibold">2 New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80">
                      <p className="font-semibold text-primary">💧 Hydration Check</p>
                      <p className="text-[11px] text-outline mt-0.5">
                        Take a mindful pause and enjoy fresh water.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/60 border border-white/80">
                      <p className="font-semibold text-primary">Afternoon reset</p>
                      <p className="text-[11px] text-outline mt-0.5">
                        Deep focus session begins in 15 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* QUICK ADD */}
            <button
              type="button"
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="berry-button flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-2 text-[12px] sm:text-[13px] font-semibold text-white shadow-sm transition active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">
                add
              </span>

              <span className="hidden sm:inline">Quick Add</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* PROFILE */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-200 to-rose-200 text-sm ring-2 ring-white shadow-sm hover:scale-105 transition-transform"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  "👩🏻"
                )}
              </button>

              {profileMenuOpen && (
                <div className="fixed sm:absolute right-4 sm:right-0 top-[72px] sm:top-12 z-50 w-64 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/70">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-200 to-rose-200 ring-2 ring-white text-base">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "👩🏻"
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-bold text-on-surface">
                        {displayName ? `${displayName} ` : "Bloom Guest "}
                      </span>
                      <span className="truncate text-[11px] text-outline">
                        {user?.email || "Guest Sanctuary"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 text-[13px]">
                    <Link
                      href="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-on-surface-variant transition hover:bg-white hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        settings
                      </span>
                      <span>Settings & Profile</span>
                    </Link>

                    {user ? (
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileMenuOpen(false);
                          await signOut();
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-outline transition hover:bg-[#B85C7A]/10 hover:text-[#B85C7A]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          logout
                        </span>
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-primary font-semibold transition hover:bg-white"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          login
                        </span>
                        <span>Log In / Sign Up</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QUICK ADD MENU */}
      {quickAddOpen && (
        <div className="fixed right-4 sm:right-8 top-[72px] z-50 w-72 rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95">
          <div className="mb-2 flex items-center justify-between border-b border-white/60 px-1 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
              Create in Sanctuary
            </span>

            <button
              onClick={() => setQuickAddOpen(false)}
              className="text-outline transition hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {[
              ["check_circle", "New Task"],
              ["calendar_today", "New Event"],
              ["menu_book", "New Journal Entry"],
              ["favorite", "Log Mood"],
              ["auto_awesome", "Ask Bloom AI"],
            ].map(([icon, label]) => (
              <button
                key={label}
                onClick={() => handleAction(label)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-on-surface transition hover:bg-white/70"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  {icon}
                </span>

                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;
