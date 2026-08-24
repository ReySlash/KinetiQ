import { describe, expect, it } from "vitest";
import { buildApiUrl, buildUrl } from "@/lib/url";
import { getSafeRedirect } from "@/lib/auth-api";

describe("URL helpers", () => {
  it("joins origins, paths, and query values predictably", () => {
    expect(buildUrl("https://example.com/base/", "/items", { page: 2, archived: false })).toBe(
      "https://example.com/base/items?page=2&archived=false",
    );
  });

  it("ignores empty query values", () => {
    expect(buildApiUrl("routines", { search: undefined, page: null })).toBe(
      "http://localhost:3000/api/routines",
    );
  });

  it("only accepts local callback redirects", () => {
    expect(getSafeRedirect("/routines")).toBe("/routines");
    expect(getSafeRedirect("https://example.com")).toBe("/dashboard");
    expect(getSafeRedirect("//example.com")).toBe("/dashboard");
  });
});
