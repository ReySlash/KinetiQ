"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SideNav } from "./side-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { User2 } from "lucide-react";
import { authApi, type AuthSession } from "@/lib/auth-api";

export function AppSidebar() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    void authApi
      .getSession()
      .then(setSession)
      .catch(() => setSession(null));
  }, []);

  async function handleSignOut() {
    await authApi.signOut();
    setSession(null);
    router.replace("/sign-in");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center gap-2 overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 px-2 py-2 transition-colors group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger className="shrink-0" />
          <h3 className="truncate text-lg font-semibold tracking-tight group-data-[collapsible=icon]:sr-only">
            <span className="text-primary">Kineti</span>Q
          </h3>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SideNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex w-full items-center justify-start gap-2 rounded-xl group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {session?.user.name.slice(0, 2).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="truncate group-data-[collapsible=icon]:sr-only">
                      {session?.user.name ?? "Account"}
                    </p>
                  </Button>
                }
              />
              <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                  {session ? (
                    <DropdownMenuItem onClick={() => void handleSignOut()}>
                      <User2 />
                      Sign out
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem render={<Link href="/sign-in" />}>
                      <User2 />
                      Sign in
                    </DropdownMenuItem>
                  )}

                  <ThemeToggle />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
