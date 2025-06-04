
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Users,
  BarChart3,
  Zap,
  Target,
  Plus,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import QuickActionModal from "./modals/QuickActionModal";

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AppSidebar = ({ activeTab, onTabChange }: AppSidebarProps) => {
  const { user } = useAuth();
  const [quickActionModal, setQuickActionModal] = useState<{ isOpen: boolean; action: string }>({
    isOpen: false,
    action: "",
  });

  const handleQuickAction = (action: string) => {
    setQuickActionModal({ isOpen: true, action });
  };

  const teacherItems = [
    {
      title: "Overview",
      url: "overview",
      icon: BarChart3,
    },
    {
      title: "Classes",
      url: "classes",
      icon: Users,
    },
    {
      title: "Assignments",
      url: "assignments",
      icon: BookOpen,
    },
    {
      title: "Student Scores",
      url: "scores",
      icon: Target,
    },
  ];

  const studentItems = [
    {
      title: "Assignments",
      url: "assignments",
      icon: BookOpen,
    },
    {
      title: "Practice",
      url: "practice",
      icon: GraduationCap,
    },
    {
      title: "Speed Test",
      url: "typing-test",
      icon: Zap,
    },
    {
      title: "Progress",
      url: "progress",
      icon: BarChart3,
    },
  ];

  const teacherQuickActions = [
    {
      title: "New Class",
      action: "classes",
      icon: Plus,
    },
    {
      title: "Add Student",
      action: "students",
      icon: UserPlus,
    },
    {
      title: "New Assignment",
      action: "assignments",
      icon: BookOpen,
    },
  ];

  const studentQuickActions = [
    {
      title: "Speed Test",
      action: "speed-test",
      icon: Zap,
    },
    {
      title: "Practice",
      action: "assignments",
      icon: Target,
    },
  ];

  const items = user?.type === "teacher" ? teacherItems : studentItems;
  const quickActions = user?.type === "teacher" ? teacherQuickActions : studentQuickActions;

  return (
    <>
      <Sidebar className="border-r border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
        <SidebarHeader className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                StenoLearn
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {user?.type} Portal
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 sm:px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
                        w-full justify-start px-3 py-2 rounded-lg transition-all duration-200
                        ${activeTab === item.url 
                          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white shadow-lg' 
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:via-purple-950/50 dark:hover:to-indigo-950/50'
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline ml-2 text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((action) => (
                  <SidebarMenuItem key={action.title}>
                    <SidebarMenuButton
                      onClick={() => handleQuickAction(action.action)}
                      className="w-full justify-start px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:via-emerald-50 hover:to-teal-50 dark:hover:from-green-950/50 dark:hover:via-emerald-950/50 dark:hover:to-teal-950/50 hover:shadow-md"
                    >
                      <action.icon className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span className="hidden sm:inline ml-2 text-sm font-medium">{action.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3 sm:p-4 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left">
            <span className="hidden sm:inline">Welcome, </span>
            <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user?.name}
            </span>
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
