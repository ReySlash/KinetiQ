import Link from "next/link";
import { RxDashboard } from "react-icons/rx";
import { IoMdFitness } from "react-icons/io";
import { GiStrong } from "react-icons/gi";
import { IoFitness } from "react-icons/io5";
import { BsClipboard2DataFill } from "react-icons/bs";
import { FaChartBar, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
    href: "/muscle-groups",
    label: "Muscle Groups",
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
      <SidebarMenu>
        {items.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              tooltip={label}
              render={<Link href={href} aria-label={label} />}
              className="h-9"
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
