
import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { LogOut, User } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "teacher" | "student";
  userName: string;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout = ({
  children,
  userType,
  userName,
  onLogout,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <AppSidebar activeTab={activeTab} onTabChange={onTabChange} />
        
        <SidebarInset className="flex-1">
          <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex justify-between items-center h-16 px-4 lg:px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" />
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                    StenoLearn
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">{userName}</span>
                </div>
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={onLogout} className="hidden sm:flex">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onLogout} className="sm:hidden">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </nav>
          
          <main className="p-4 lg:p-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
