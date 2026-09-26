"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { extractCleanName } from "@/lib/user-name";
import { fetchUserSpaces, createSpace, uploadSpaceImage } from "@/lib/spaces";
import { Space, SpaceType } from "@/types/space";
import { CreateSpaceModal } from "@/components/spaces/CreateSpaceModal";

const mainNavigation = [
  { name: "Today", href: "/", icon: "spa" },
  { name: "Calendar", href: "/calendar", icon: "calendar_today" },
  { name: "Tasks", href: "/tasks", icon: "check_circle" },
  { name: "Timetable", href: "/timetable", icon: "schedule", badge: "SCAN" },
  { name: "Journal", href: "/journal", icon: "menu_book" },
  { name: "Mood", href: "/mood", icon: "favorite" },
  { name: "Reminders", href: "/reminders", icon: "notifications" },
  { name: "Bloom AI", href: "/bloom-ai", icon: "auto_awesome", sparkle: true },
];

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const displayName = extractCleanName(
    profile?.display_name || user?.user_metadata?.display_name,
    user?.email
  );

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchUserSpaces(user?.id).then((data) => {
      if (mounted) setSpaces(data);
    });
    return () => {
      mounted = false;
    };
  }, [user?.id, pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/today";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleCreateSpace = async (data: {
    name: string;
    description: string;
    icon: string;
    type: SpaceType;
    cover_color: any;
    image_file?: File;
  }) => {
    const created = await createSpace(data, user?.id);
    setSpaces((prev) => [created, ...prev]);

    let savedSpace = created;
    if (data.image_file) {
      try {
        savedSpace = await uploadSpaceImage(created, data.image_file, user?.id);
        setSpaces((prev) => prev.map((space) => (space.id === created.id ? savedSpace : space)));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image upload failed.';
        router.push(`/spaces/${created.id}`);
        return {
          warning: `The Space was created, but its image could not be saved. ${message} You can retry from the Space page.`,
        };
      }
    }

    setIsCreateSpaceOpen(false);
    if (onClose) onClose();
    router.push(`/spaces/${savedSpace.id}`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#351A26]/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col justify-between border-r border-white/70 bg-white/45 px-4 py-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-3xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* TOP */}
        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto scrollbar-hide">
          {/* BRAND */}
          <div className="flex items-center gap-3 px-3 py-1.5">
            <div className="berry-button flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-md">
              <span className="material-symbols-outlined text-[20px]">
                local_florist
              </span>
            </div>

            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-[20px] font-bold tracking-tight text-[#351A26]">
                Bloom
                <span className="text-[17px] text-primary"></span>
              </span>

              <span className="text-[11px] font-medium uppercase tracking-wider text-outline">
                Sanctuary OS
              </span>
            </div>
          </div>

          {/* MAIN NAVIGATION */}
          <nav className="flex flex-col gap-1.5">
            {mainNavigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    group flex items-center justify-between rounded-full
                    px-4 py-2.5 text-[14px] font-semibold
                    transition-all duration-200
                    ${
                      active
                        ? "berry-button text-white shadow-sm"
                        : "text-on-surface-variant hover:bg-white/60 hover:text-on-surface"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>

                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`
                        rounded-full border px-2 py-0.5 text-[10px]
                        font-bold uppercase tracking-wider
                        ${
                          active
                            ? "border-white/30 bg-white/20 text-white"
                            : "border-white bg-white/70 text-primary"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.sparkle && (
                    <span
                      className={`text-[14px] font-bold ${
                        active ? "text-white" : "text-primary"
                      }`}
                    >
                      ✦
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* DEDICATED SPACES SECTION */}
          <div className="border-t border-white/60 pt-4">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-outline">
                SPACES
              </span>

              <button
                type="button"
                onClick={() => setIsCreateSpaceOpen(true)}
                title="Create a new Space"
                aria-label="Create Space"
                className="flex h-6 w-6 items-center justify-center rounded-full text-outline hover:bg-white/80 hover:text-primary transition-colors font-bold text-[18px]"
              >
                +
              </button>
            </div>

            {/* Dynamic Space List */}
            <div className="flex flex-col gap-1">
              {spaces.map((space) => {
                const href = `/spaces/${space.id}`;
                const active = pathname === href;

                return (
                  <Link
                    key={space.id}
                    href={href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 rounded-full px-4 py-2
                      text-[13px] font-semibold transition-all duration-200
                      ${
                        active
                          ? "berry-button text-white shadow-sm font-bold"
                          : "text-on-surface-variant hover:bg-white/60 hover:text-on-surface"
                      }
                    `}
                  >
                    
                    <span className="truncate">{space.name}</span>
                  </Link>
                );
              })}

              {spaces.length === 0 && (
                <div className="px-3 py-1.5 text-[12px] text-outline">
                  No spaces yet.
                </div>
              )}

              {/* View all spaces */}
              <Link
                href="/spaces"
                onClick={handleLinkClick}
                className={`
                  mt-1 flex items-center justify-between rounded-full px-4 py-2
                  text-[12px] font-semibold text-outline transition-all
                  hover:bg-white/50 hover:text-primary
                  ${pathname === "/spaces" ? "text-primary font-bold bg-white/40" : ""}
                `}
              >
                <span>View all spaces</span>
                <span className="text-[14px]">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-2 border-t border-white/60 pt-4">
          <Link
            href="/settings"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              pathname === "/settings"
                ? "berry-button text-white shadow-sm"
                : "text-on-surface-variant hover:bg-white/60"
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">
              settings
            </span>

            <span>Settings</span>
          </Link>

          {user ? (
            <button
              type="button"
              onClick={signOut}
              title="Sign out of Bloom"
              className="flex items-center gap-3 rounded-full px-4 py-2 text-[13px] font-semibold text-outline transition hover:bg-white/60 hover:text-primary text-left"
            >
              <span className="material-symbols-outlined text-[19px]">
                logout
              </span>

              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="flex items-center gap-3 rounded-full px-4 py-2 text-[13px] font-semibold text-primary transition hover:bg-white/60 text-left"
            >
              <span className="material-symbols-outlined text-[19px]">
                login
              </span>

              <span>Sign In / Join</span>
            </Link>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/50 px-3 py-2.5 shadow-sm backdrop-blur-xl">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-rose-200 to-rose-200 ring-2 ring-white text-sm">
              <span>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : "👩🏻"}</span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-bold text-on-surface">
                {displayName ? `${displayName} ` : "Bloom Guest "}
              </span>

              <span className="truncate text-[10px] font-medium text-outline">
                {user?.email || "Guest Sanctuary"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* CREATE SPACE MODAL FROM SIDEBAR */}
      <CreateSpaceModal
        isOpen={isCreateSpaceOpen}
        onClose={() => setIsCreateSpaceOpen(false)}
        onSubmit={handleCreateSpace}
      />
    </>
  );
}

export default Sidebar;
