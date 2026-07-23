import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { IoMdFitness } from "react-icons/io";
import { GiStrong } from "react-icons/gi";
import { IoFitness } from "react-icons/io5";
import { BsClipboard2DataFill } from "react-icons/bs";
import { FaChartBar, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: RxDashboard,
  },
  {
    href: "/exercises",
    label: "Exercises",
    icon: IoMdFitness,
  },
  {
    href: "/muscles",
    label: "Muscles",
    icon: GiStrong,
  },
  {
    href: "/routines",
    label: "Routines",
    icon: IoFitness,
  },
  {
    href: "/training-programs",
    label: "Training Programs",
    icon: BsClipboard2DataFill,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: FaChartBar,
  },
  {
    href: "/progress",
    label: "Progress",
    icon: FaChartLine,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: FaCalendarAlt,
  },
] as const;

export function SideNav() {
  return (
    <nav aria-label="Primary">
      <div className="grid gap-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              navigationMenuTriggerStyle(),
              "flex flex-row items-center justify-start text-left gap-1",
            )}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
