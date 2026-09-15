import { cookies } from "next/headers";

import { isValidTimezone, TIMEZONE_COOKIE } from "@/lib/timezone";

export async function getServerTimezone(): Promise<string | null> {
  const value = (await cookies()).get(TIMEZONE_COOKIE)?.value;
  return isValidTimezone(value) ? value : null;
}
