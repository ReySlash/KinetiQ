export const TIMEZONE_COOKIE = "kinetiq-timezone";

export function isValidTimezone(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
