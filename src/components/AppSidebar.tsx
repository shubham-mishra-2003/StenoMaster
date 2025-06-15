import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Target,
  TrendingUp,
  LogOut,
  Plus,
  GraduationCap,
} from "lucide-react";
import QuickActionModal from "./QuickActionModal";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "./Logo";

interface AppSidebarProps {
  onLogout: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [quickActionOpen, setQuickActionOpen] = React.useState(false);
  const [quickAction, setQuickAction] = React.useState("");

  const teacherItems = [
    {
      title: "Dashboard",
      url: "/dashboard/teacher",
      icon: Home,
    },
    {
      title: "Classes",
      url: "/dashboard/teacher/classes",
      icon: Users,
    },
    {
      title: "Assignments",
      url: "/dashboard/teacher/assignments",
      icon: FileText,
    },
    {
      title: "Student Scores",
      url: "/dashboard/teacher/scores",
      icon: BarChart3,
    },
  ];

  const studentItems = [
    {
      title: "Dashboard",
      url: "/dashboard/student",
      icon: Home,
    },
    {
      title: "Practice",
      url: "/dashboard/student/practice",
      icon: BookOpen,
    },
    {
      title: "Test",
      url: "/dashboard/student/test",
      icon: Target,
    },
    {
      title: "Progress",
      url: "/dashboard/student/progress",
      icon: TrendingUp,
    },
  ];

  const items = user?.type === "teacher" ? teacherItems : studentItems;

  const isActive = (url: string) => {
    if (url === `/dashboard/${user?.type}`) {
      return pathname === url;
    }
    return pathname === url;
  };

  const handleQuickAction = () => {
    const action = user?.type === "teacher" ? "assignments" : "speed-test";
    setQuickAction(action);
    setQuickActionOpen(true);
  };

  const handleActionSelect = (tab: string) => {
    setQuickActionOpen(false);
  };

  const { colorScheme } = useTheme();

  return (
    <>
      <TooltipProvider>
        <Sidebar
          className={`border-r ${
            colorScheme === "dark"
              ? "border-gray-800/50 bg-gray-900"
              : "border-gray-200/50 bg-white"
          } data-[mobile=true]:bg-gradient-to-b ${
            colorScheme === "dark"
              ? "data-[mobile=true]:from-gray-900 data-[mobile=true]:via-blue-950/90 data-[mobile=true]:to-purple-950/90"
              : "data-[mobile=true]:from-white data-[mobile=true]:via-blue-50/90 data-[mobile=true]:to-purple-50/90"
          }`}
        >
          <SidebarHeader
            className={`border-b border-border/50 bg-gradient-to-r ${
              colorScheme == "dark"
                ? "from-blue-950/50 via-purple-950/30 to-indigo-950/50"
                : "from-blue-50/50 via-purple-50/30 to-indigo-50/50"
            }`}
          >
            <Logo height={50} width={50} />
          </SidebarHeader>
          <SidebarContent
            className={`bg-gradient-to-b from-transparent ${
              colorScheme
                ? "via-blue-950/20 to-purple-950/20"
                : "via-blue-50/20 to-purple-50/20"
            }  `}
          >
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-2 group-data-[collapsible=icon]:hidden">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className={`
                         w-full cursor-pointer justify-start px-3 py-2 rounded-lg transition-all duration-200
                         ${
                           active
                             ? "gradient-button shadow-lg"
                             : `bg-gradient-to-r ${
                                 colorScheme === "dark"
                                   ? "hover:from-blue-600/50 hover:via-purple-600/50 hover:to-indigo-950/50"
                                   : "hover:from-blue-200 hover:via-purple-200 hover:to-indigo-50"
                               }`
                         }
                       `}
                            >
                              <Link
                                href={item.url}
                                className="flex items-center space-x-3 w-full"
                              >
                                <Icon className={`h-5 w-5`} />
                                <span
                                  className={`font-medium group-data-[collapsible=icon]:sr-only`}
                                >
                                  {item.title}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="group-data-[collapsible=expanded]:hidden"
                          >
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-4 py-2 group-data-[collapsible=icon]:hidden">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleQuickAction}
                        className="w-full gradient-button group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=expanded]:mr-2" />
                        <span className="group-data-[collapsible=icon]:sr-only">
                          {user?.type === "teacher"
                            ? "Add Assignment"
                            : "Start Practice"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="group-data-[collapsible=expanded]:hidden"
                    >
                      {user?.type === "teacher"
                        ? "Add Assignment"
                        : "Start Practice"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter
            className={`border-t border-border/50 bg-gradient-to-r ${
              colorScheme == "dark"
                ? "from-blue-950/50 via-purple-950/30 to-indigo-950/50"
                : "from-blue-50/50 via-purple-50/30 to-indigo-50/50"
            }`}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="mx-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/50 hover:via-purple-50/30 hover:to-indigo-50/50 dark:hover:from-blue-950/50 dark:hover:via-purple-950/30 dark:hover:to-indigo-950/50 transition-all duration-200 group-data-[collapsible=icon]:justify-center">
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500">
                        <AvatarFallback className="bg-transparent text-white font-semibold">
                          {user?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">
                          {user?.name}
                        </span>
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
                      onClick={onLogout}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </TooltipProvider>

      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        action={quickAction}
        onActionSelect={handleActionSelect}
      />
    </>
  );
};

export default AppSidebar;
