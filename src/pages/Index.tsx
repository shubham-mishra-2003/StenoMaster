import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardLayout from "@/components/DashboardLayout";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";
import LandingPage from "./LandingPage";

const Index = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.type === "teacher" ? "overview" : "assignments"
  );

  if (!isAuthenticated || !user) {
    return (
      <ThemeProvider defaultTheme="system">
        <LandingPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system">
      <DashboardLayout
        userType={user.type}
        userName={user.name}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {user.type === "teacher" ? (
          <TeacherDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <StudentDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </DashboardLayout>
    </ThemeProvider>
  );
};

export default Index;
