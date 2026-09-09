"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RxDashboard } from "react-icons/rx";
import { IoMdFitness } from "react-icons/io";
import { GiStrong } from "react-icons/gi";
import { IoFitness } from "react-icons/io5";
import { BsClipboard2DataFill } from "react-icons/bs";
import { FaChartBar, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { Dumbbell } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export const navigationItems = [
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
    href: "/workout-sessions",
    label: "Workouts",
    icon: Dumbbell,
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
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  function handleNavigation() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <nav aria-label="Primary">
      <SidebarMenu>
        {navigationItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={label}
                render={
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    onClick={handleNavigation}
                  />
                }
                className="h-10 rounded-xl text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground data-active:bg-primary/20 data-active:font-medium data-active:text-primary"
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </nav>
  );
}
