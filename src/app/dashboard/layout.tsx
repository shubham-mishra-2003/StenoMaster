"use client";

import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/ThemeProvider";
import Logo from "@/components/Logo";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "teacher" | "student";
  userName: string;
  onLogout: () => void;
}

const DashboardLayout = ({
  children,
  userType,
  userName,
  onLogout,
}: DashboardLayoutProps) => {
  const { colorScheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to landing page with login modal open
      router.push("/?showLogin=true");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Prevent rendering until redirect
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div
          className={`min-h-screen flex w-full bg-gradient-to-br ${
            colorScheme == "dark"
              ? "from-slate-900 via-slate-800 to-slate-900"
              : "from-slate-50 via-blue-50 to-slate-100"
          }`}
        >
          <AppSidebar onLogout={onLogout} />
          <SidebarInset className="flex-1 flex flex-col">
            <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex justify-between items-center h-16 px-4 lg:px-6">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="flex gap-2 justify-center items-center">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{userName}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-sm"></div>
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="hidden sm:flex"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="sm:hidden"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </nav>

            <main className="flex-1 p-4 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            <footer
              className={`border-t border-border/50 bg-gradient-to-r backdrop-blur-sm ${
                colorScheme == "dark"
                  ? "from-blue-950/50 via-purple-950/30 to-indigo-950/50"
                  : "from-blue-50/50 via-purple-50/30 to-indigo-50/50"
              }`}
            >
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <Logo height={30} width={30} />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      © 2024 StenoLearn. Empowering stenography education.
                    </p>
                  </div>

                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <a
                      href="#"
                      className="hover:text-primary transition-colors"
                    >
                      Help
                    </a>
                    <a
                      href="#"
                      className="hover:text-primary transition-colors"
                    >
                      Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default DashboardLayout;
