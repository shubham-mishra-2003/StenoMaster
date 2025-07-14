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
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Users,
  FileText,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "./Logo";
import UserButton from "./UserButton";

const AppSidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

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
  ];

  const studentItems = [
    {
      title: "Dashboard",
      url: "/dashboard/student",
      icon: Home,
    },
    {
      title: "Assignment",
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

  const items = user?.userType === "teacher" ? teacherItems : studentItems;

  const isActive = (url: string) => {
    if (url === `/dashboard/${user?.userType}`) {
      return pathname === url;
    }
    return pathname === url;
  };

  const { colorScheme } = useTheme();

  return (
    <>
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
          className={`border-b h-16 items-center justify-center border-border/50 bg-gradient-to-r ${
            colorScheme == "dark"
              ? "from-blue-950/50 via-purple-950/30 to-indigo-950/50"
              : "from-blue-50/50 via-purple-50/30 to-indigo-50/50"
          }`}
        >
          <Logo height={50} width={50} />
        </SidebarHeader>
        <SidebarContent
          className={`bg-gradient-to-b from-transparent flex flex-col justify-between ${
            colorScheme == "dark"
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
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter
          className={`border-t border-border/50 p-1 bg-gradient-to-r ${
            colorScheme == "dark"
              ? "from-blue-950/50 via-purple-950/30 to-indigo-950/50"
              : "from-blue-50/50 via-purple-50/30 to-indigo-50/50"
          }`}
        >
          <span
            className={`text-center text-sm font-bold w-full mb-1 copyright-message ${
              colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
            }`}
          >
            <p>Copyright © {new Date().getFullYear()}</p>
            <p>Powered By Connect & Team</p>
          </span>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
