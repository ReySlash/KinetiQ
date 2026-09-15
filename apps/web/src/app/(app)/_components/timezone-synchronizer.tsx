"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { isValidTimezone, TIMEZONE_COOKIE } from "@/lib/timezone";

function cookieValue(name: string): string | null {
  const prefix = `${name}=`;
  const entry = document.cookie
    .split("; ")
    .find((value) => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function TimezoneSynchronizer() {
  const router = useRouter();

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!isValidTimezone(timezone) || cookieValue(TIMEZONE_COOKIE) === timezone) {
      return;
    }

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
    router.refresh();
  }, [router]);

  return null;
}
