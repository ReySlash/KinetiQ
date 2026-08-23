import Link from "next/link";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StyledLinkProps = {
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  children?: React.ReactNode;
  onClick?: React.ComponentProps<typeof Link>["onClick"];
};

export default function StyledLink(props: StyledLinkProps) {
  const {
    href,
    variant = "default",
    size = "default",
    className,
    children,
    onClick,
  } = props;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </Link>
  );
}
