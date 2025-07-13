import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const UserButton = () => {
  const { colorScheme } = useTheme();
  const { user, logout } = useAuth();

  if (!user || !user.fullName) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-lg p-3 h-14 justify-center cursor-pointer overflow-hidden w-full">
          <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {user?.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start w-full">
            <span className="text-sm font-medium text-start truncate capitalize w-full">
              {user?.fullName}
            </span>
            <span className="text-xs capitalize">{user?.userType}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 p-0 rounded-2xl shadow-2xl border-0"
      >
        <DropdownMenuItem
          onClick={logout}
          className={`cursor-pointer p-3 px-4 font-bold text-sm bg-gradient-to-tr border rounded-2xl ${
            colorScheme == "dark"
              ? "from-red-900 to-red-900 hover:to-red-500 hover:from-red-800 border-red-800"
              : "from-red-100 to-red-200 hover:to-red-300 hover:from-red-400 border-red-400"
          }`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
