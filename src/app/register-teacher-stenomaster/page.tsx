"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus } from "lucide-react";
import React, { useState } from "react";

const page = () => {
  const [teacherSignup, setTeacherSignup] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [clicked, setClicked] = useState(false);
  const { signup } = useAuth();
  const handleTeacherSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setClicked(true);
    if (
      !teacherSignup.fullName.trim() ||
      !teacherSignup.email.trim() ||
      !teacherSignup.password.trim() ||
      !teacherSignup.confirmPassword.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      setClicked(false);
      return;
    }

    if (teacherSignup.password !== teacherSignup.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setClicked(false);
      return;
    }

    if (teacherSignup.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setClicked(false);
      return;
    }

    signup({
      fullName: teacherSignup.fullName,
      email: teacherSignup.email,
      password: teacherSignup.password,
      userType: "teacher",
    }).then(() => {
      setClicked(false);
    });
  };

  return (
    <Card className="w-full max-w-md p-6 bg-white/50 backdrop-blur-md border border-gray-200 shadow-lg">
      <form onSubmit={handleTeacherSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            value={teacherSignup.fullName}
            onChange={(e) =>
              setTeacherSignup((prev) => ({
                ...prev,
                fullName: e.target.value,
              }))
            }
            className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={teacherSignup.email}
            onChange={(e) =>
              setTeacherSignup((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Create a password (min. 6 characters)"
            value={teacherSignup.password}
            onChange={(e) =>
              setTeacherSignup((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={teacherSignup.confirmPassword}
            onChange={(e) =>
              setTeacherSignup((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
          />
        </div>
        <Button
          disabled={clicked}
          type="submit"
          className="gradient-button w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Teacher Account
        </Button>
      </form>
    </Card>
  );
};

export default page;
