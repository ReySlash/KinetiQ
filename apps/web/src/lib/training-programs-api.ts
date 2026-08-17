const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class TrainingProgramApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api/${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String(payload.message)
        : "Something went wrong. Please try again.";
    throw new TrainingProgramApiError(message, response.status);
  }

  return payload as T;
}

export function deleteTrainingProgram(slug: string) {
  return request<{ message: string; slug: string }>(`training-programs/${slug}`, {
    method: "DELETE",
  });
}
