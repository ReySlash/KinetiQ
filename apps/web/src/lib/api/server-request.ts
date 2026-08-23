import { cookies } from "next/headers";

import { buildApiUrl } from "@/lib/url";
import { parseApiResponse } from "./error";

export async function serverRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(buildApiUrl(path), {
    ...options,
    cache: options?.cache ?? "no-store",
    headers: {
      ...options?.headers,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  return parseApiResponse<T>(response);
}
