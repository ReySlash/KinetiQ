import { ApiError } from "@/lib/api/error";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string | null; message: string };

export async function actionResult<T>(
  operation: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        status: error.status,
        code: error.code,
        message: error.message,
      };
    }

    return {
      ok: false,
      status: 500,
      code: null,
      message: "Something went wrong. Please try again.",
    };
  }
}
