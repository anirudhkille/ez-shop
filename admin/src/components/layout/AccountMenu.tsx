"use client";
import { SidebarMenuButton, useSidebar } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export default function AccountMenu() {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const handleLogout = () => {
    router.push("/");
  };
  const name = "anirudhkille";
  const email = "anirudhkille@gmail.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="w-8 h-8 rounded-full">
            <AvatarImage alt={name || ""} />
            <AvatarFallback className="flex items-center justify-center h-full text-center uppercase rounded-full">
              {name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="w-8 h-8 rounded-lg">
              <AvatarImage alt={name || ""} />
              <AvatarFallback className="uppercase rounded-lg">
                {name?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-semibold truncate">{name}</span>
              <span className="text-xs truncate">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
