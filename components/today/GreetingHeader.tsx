"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { extractCleanName } from "@/lib/user-name";

export default function GreetingHeader() {
  const { user, profile } = useAuth();
  const [localName, setLocalName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bloom_user_name");
      if (stored) setLocalName(stored);
    } catch {
      // Ignore if localStorage is unavailable.
    }
  }, []);

  const cleanName =
    extractCleanName(
      profile?.display_name || user?.user_metadata?.display_name || localName,
      user?.email
    ) || "friend";

  return (
    <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-[26px] leading-tight sm:text-[36px] lg:text-[42px] text-[#351A26]">
          Good morning, <span className="text-primary">{cleanName}.</span>
        </h1>
        <p className="editorial mt-2 text-sm text-on-surface-variant">
          Take it one thing at a time.
        </p>
      </div>

      <div className="glass-pill max-w-full self-start rounded-full px-4 py-2 text-[12px] font-semibold text-primary sm:self-auto sm:px-5 sm:py-3 sm:text-[13px]">
        2 assignments due this weekend
      </div>
    </div>
  );
}
