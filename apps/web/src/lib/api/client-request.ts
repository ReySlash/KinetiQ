import { buildApiUrl } from "@/lib/url";
import { parseApiResponse } from "./error";

export async function clientRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  return parseApiResponse<T>(response);
}
