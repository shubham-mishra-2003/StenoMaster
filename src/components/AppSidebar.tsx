import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Users,
  BarChart3,
  Zap,
  Target,
  Plus,
  GraduationCap,
  UserPlus
} from "lucide-react";
import QuickActionModal from "./modals/QuickActionModal";
import Image from "next/image";
import { useTheme } from "@/hooks/ThemeProvider";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [quickActionModal, setQuickActionModal] = useState<{
    isOpen: boolean;
    action: string;
  }>({
    isOpen: false,
    action: ""
  });

  const handleQuickAction = (action: string) => {
    setQuickActionModal({ isOpen: true, action });
  };

  const teacherItems = [
    { title: "Overview", url: "overview", icon: BarChart3 },
    { title: "Classes", url: "classes", icon: Users },
    { title: "Assignments", url: "assignments", icon: BookOpen },
    { title: "Student Scores", url: "scores", icon: Target }
  ];

  const studentItems = [
    { title: "Assignments", url: "assignments", icon: BookOpen },
    { title: "Practice", url: "practice", icon: GraduationCap },
    { title: "Speed Test", url: "typing-test", icon: Zap },
    { title: "Progress", url: "progress", icon: BarChart3 }
  ];

  const teacherQuickActions = [
    { title: "New Class", action: "classes", icon: Plus },
    { title: "Add Student", action: "students", icon: UserPlus },
    { title: "New Assignment", action: "assignments", icon: BookOpen }
  ];

  const studentQuickActions = [
    { title: "Speed Test", action: "speed-test", icon: Zap },
    { title: "Practice", action: "assignments", icon: Target }
  ];

  const items = user?.type === "teacher" ? teacherItems : studentItems;
  const quickActions =
    user?.type === "teacher" ? teacherQuickActions : studentQuickActions;

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
          className={"p-2 sm:p-3 border-b border-b border-b-purple-300"}
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <Image src="/logo.png" alt="Logo" width={46} height={32} />
            <div className="block">
              <h2 className="text-md font-bold gradient-text">StenoLearn</h2>
              <p
                className={`text-xs ${
                  colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
                } capitalize`}
              >
                {user?.type} Portal
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 sm:px-4">
          <SidebarGroup>
            <SidebarGroupLabel
              className={`text-xs font-semibold ${
                colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
              } uppercase tracking-wider`}
            >
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeTab === item.url}
                      onClick={() => onTabChange(item.url)}
                      className={`
                         w-full cursor-pointer justify-start px-3 py-2 rounded-lg transition-all duration-200
                         ${
                           activeTab === item.url
                             ? "gradient-button shadow-lg"
                             : `bg-gradient-to-r ${
                                 colorScheme === "dark"
                                   ? "hover:from-blue-600/50 hover:via-purple-600/50 hover:to-indigo-950/50"
                                   : "hover:from-blue-200 hover:via-purple-200 hover:to-indigo-50"
                               }`
                         }
                       `}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="ml-2 text-sm font-medium">
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel
              className={`text-xs font-semibold ${
                colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
              } uppercase tracking-wider`}
            >
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((action) => (
                  <SidebarMenuItem key={action.title}>
                    <SidebarMenuButton
                      onClick={() => handleQuickAction(action.action)}
                      className={`w-full justify-start px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r ${
                        colorScheme === "dark"
                          ? "hover:from-green-950/90 hover:via-emerald-950/90 hover:to-teal-950/90"
                          : "hover:from-green-50/90 hover:via-emerald-50/90 hover:to-teal-50/90"
                      } hover:shadow-md`}
                    >
                      <action.icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          colorScheme === "dark"
                            ? "text-green-400"
                            : "text-green-600"
                        }`}
                      />
                      <span className="ml-2 text-sm font-medium">
                        {action.title}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter
          className={"p-7 sm:p-5 border-t border-border/50"}
        >
          <div
            className={`text-lg ${
              colorScheme === "dark" ? "text-gray-400" : "text-gray-600"
            } text-center`}
          >
            <span className="inline">Welcome, </span>
            <span className="font-medium gradient-text">{user?.name}</span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <QuickActionModal
        isOpen={quickActionModal.isOpen}
        onClose={() => setQuickActionModal({ isOpen: false, action: "" })}
        action={quickActionModal.action}
        onActionSelect={onTabChange}
      />
    </>
  );
};

export default AppSidebar;
