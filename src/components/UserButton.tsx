import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuButton } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

const UserButton = () => {
  const { colorScheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className={`rounded-lg hover:bg-gradient-to-r transition-all duration-200 group-data-[collapsible=icon]:justify-center ${
            colorScheme == "dark"
              ? "hover:from-blue-950/50 hover:via-purple-950/30 hover:to-indigo-950/50"
              : "hover:from-blue-50/50 hover:via-purple-50/30 hover:to-indigo-50/50"
          }`}
        >
          <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.type}
            </span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-950/90 dark:to-purple-950/95 backdrop-blur-xl border-0 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 text-red-600 dark:text-red-400"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
