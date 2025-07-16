import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, RefreshCcw } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type FetchedState = {
  data: boolean;
  assignment: boolean;
  teacherClass: boolean;
  studentInClass: boolean;
  score: boolean;
};

type IsLoadingState = {
  dataLoading: boolean;
  assignmentsLoading: boolean;
  teacherClass: boolean;
  studentInClass: boolean;
  score: boolean;
  refresh: boolean;
};

interface userButtonProps {
  fetched: FetchedState;
  setFetched: React.Dispatch<React.SetStateAction<FetchedState>>;
  isLoading: IsLoadingState;
  setIsLoading: React.Dispatch<React.SetStateAction<IsLoadingState>>;
  onRefresh: () => Promise<void>;
}

const UserButton = ({
  fetched,
  isLoading,
  onRefresh,
  setFetched,
  setIsLoading,
}: userButtonProps) => {
  const { colorScheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user || !user.fullName) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer flex gap-2 p-2 justify-center items-center">
          <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500">
            <AvatarFallback className="bg-transparent text-white font-semibold">
              {user?.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-col items-start w-full flex">
            <span className="text-sm font-medium text-start truncate capitalize w-full">
              {user?.fullName}
            </span>
            <span className="text-xs capitalize">{user?.userType}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`relative flex flex-col gap-1 rounded-2xl overflow-hidden bg-gradient-to-br border-2 backdrop-blur-xl shadow-xl ${
          colorScheme == "dark"
            ? "from-gray-900/80 via-gray-800/60 to-gray-700/40 border-slate-700"
            : "from-white/80 via-white/60 to-white/40 border-slate-200"
        }`}
        align="end"
      >
        <Button
          onClick={() => {
            logout();
            router.push("/?showLogin=true");
          }}
          className={`cursor-pointer rounded-xl p-3 px-4 font-bold text-sm ${
            colorScheme === "dark"
              ? "bg-slate-700/70 text-red-400 hover:bg-black/60"
              : "bg-slate-200 text-red-500 hover:bg-slate-300"
          }`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <Button
          disabled={isLoading.refresh}
          onClick={() => {
            setIsLoading((prev) => ({ ...prev, refresh: true }));
            onRefresh().then(() => {
              setIsLoading((prev) => ({ ...prev, refresh: false }));
            });
          }}
          className={`cursor-pointer rounded-xl p-3 px-4 font-bold text-sm ${
            colorScheme === "dark"
              ? "bg-slate-700/70 hover:bg-black/60"
              : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          <RefreshCcw
            className={`h-6 w-6 ${isLoading.refresh ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
