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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { User2 } from "lucide-react";
import { FaDollarSign } from "react-icons/fa6";
import { IoSettingsSharp } from "react-icons/io5";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar() {
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
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className="truncate group-data-[collapsible=icon]:sr-only">
                      Username
                    </p>
                  </Button>
                }
              />
              <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User2 />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FaDollarSign />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IoSettingsSharp />
                    Settings
                  </DropdownMenuItem>

                  <ThemeToggle />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
