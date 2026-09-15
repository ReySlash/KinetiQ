import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TimezoneSynchronizer } from "@/app/(app)/_components/timezone-synchronizer";
import { isValidTimezone, TIMEZONE_COOKIE } from "@/lib/timezone";

const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("timezone", () => {
  beforeEach(() => {
    refresh.mockReset();
    document.cookie = `${TIMEZONE_COOKIE}=; path=/; max-age=0`;
  });

  it("validates IANA timezone names", () => {
    expect(isValidTimezone("Asia/Qatar")).toBe(true);
    expect(isValidTimezone("not-a-timezone")).toBe(false);
  });

  it("stores the browser timezone and refreshes once when it is missing", async () => {
    render(<TimezoneSynchronizer />);

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(document.cookie).toContain(`${TIMEZONE_COOKIE}=`);
  });
});
