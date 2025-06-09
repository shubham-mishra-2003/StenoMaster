"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import StudentDashboard from "@/components/student/StudentDashboard";
import LandingPage from "./LandingPage";

const Index = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for auth checks
  useEffect(() => {
    setIsClient(true);
    if (user?.type === "teacher") {
      setActiveTab("overview");
    } else if (user?.type === "student") {
      setActiveTab("assignments");
    }
  }, [user]);

  if (!isClient) {
    return null; // Prevent rendering during SSR
  }

  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  return (
    <DashboardLayout
      userType={user.type}
      userName={user.name}
      onLogout={logout}
      activeTab={activeTab || "assignments"}
      onTabChange={setActiveTab}
    >
      {user.type === "teacher" ? (
        <TeacherDashboard activeTab={activeTab || "overview"} onTabChange={setActiveTab} />
      ) : (
        <StudentDashboard activeTab={activeTab || "assignments"} onTabChange={setActiveTab} />
      )}
    </DashboardLayout>
  );
};

export default Index;