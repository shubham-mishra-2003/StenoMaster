
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "./ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md glass-card hover-lift">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              StenoLearn
            </h1>
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
