import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MarketingCta } from "@/app/(marketing)/_components/marketing-cta";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("MarketingCta", () => {
  it("shows a loading spinner after a normal navigation click", async () => {
    const user = userEvent.setup();
    render(
      <MarketingCta href="/sign-up" ariaLabel="Get started">
        Get started
      </MarketingCta>,
    );

    const link = screen.getByRole("link", { name: "Get started" });
    await user.click(link);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    expect(link).toHaveAttribute("aria-busy", "true");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });
});
