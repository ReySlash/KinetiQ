export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiCode(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;

  if ("code" in payload && typeof payload.code === "string") {
    return payload.code;
  }

  if (
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "code" in payload.error &&
    typeof payload.error.code === "string"
  ) {
    return payload.error.code;
  }

  return null;
}

function getApiMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;

  if ("message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ");
    }
  }

  if ("error" in payload && typeof payload.error === "object" && payload.error !== null && "message" in payload.error) {
    return typeof payload.error.message === "string" ? payload.error.message : undefined;
  }

  return undefined;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);

  const hasErrorPayload =
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    payload.error !== null &&
    typeof payload.error === "object";

  if (!response.ok || hasErrorPayload) {
    throw new ApiError(
      getApiMessage(payload) ?? "Something went wrong. Please try again.",
      response.status,
      getApiCode(payload),
    );
  }

  return payload as T;
}
