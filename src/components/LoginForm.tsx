import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { useTheme } from "@/hooks/ThemeProvider";
import { toast } from "@/hooks/use-toast";
import Logo from "./Logo";

const LoginForm = () => {
  const userTypesNav = [
    { name: "Student", value: "student", icon: BookOpen },
    { name: "Teacher", value: "teacher", icon: GraduationCap },
  ];

  const authenticationOptions = [
    { name: "Login", value: "login" },
    { name: "Register", value: "register" },
  ];

  const { login, signup } = useAuth();
  const [studentCredentials, setStudentCredentials] = useState({
    id: "",
    password: "",
  });
  const [teacherCredentials, setTeacherCredentials] = useState({
    email: "",
    password: "",
  });
  const [teacherSignup, setTeacherSignup] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("student");
  const { colorScheme } = useTheme();

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentCredentials.id.trim() || !studentCredentials.password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both Student ID and password.",
        variant: "destructive",
      });
      return;
    }

    const user = {
      id: studentCredentials.id,
      name: `${studentCredentials.id}`,
      email: `${studentCredentials.id}@student.stenolearn.com`,
      type: "student",
    };

    login({
      id: studentCredentials.id,
      password: studentCredentials.password,
      type: "student",
    });
    toast({
      title: "Welcome!",
      description: `Logged in as ${user.name}`,
    });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !teacherCredentials.email.trim() ||
      !teacherCredentials.password.trim()
    ) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    const user = {
      id: teacherCredentials.email,
      name: "Teacher",
      email: teacherCredentials.email,
      type: "teacher",
    };

    login({
      email: teacherCredentials.email,
      password: teacherCredentials.password,
      type: "teacher",
    });
    toast({
      title: "Welcome!",
      description: `Logged in as ${user.name}`,
    });
  };

  const handleTeacherSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !teacherSignup.name.trim() ||
      !teacherSignup.email.trim() ||
      !teacherSignup.password.trim() ||
      !teacherSignup.confirmPassword.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (teacherSignup.password !== teacherSignup.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (teacherSignup.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const user = {
      id: teacherSignup.email,
      name: teacherSignup.name,
      email: teacherSignup.email,
      type: "teacher",
    };

    signup({
      name: teacherSignup.name,
      email: teacherSignup.email,
      password: teacherSignup.password,
      confirmPassword: teacherSignup.confirmPassword,
    });

    toast({
      title: "Account Created!",
      description: `Welcome to StenoLearn, ${user.name}!`,
    });
  };

  return (
    <Card
      className={`w-full max-w-md mx-auto flex flex-col overflow-auto backdrop-blur-xl border shadow-xl ${
        colorScheme === "dark"
          ? "bg-black/20 border-white/10"
          : "bg-white/20 border-white/30"
      }`}
    >
      <CardHeader className="flex flex-col gap-2 justify-center items-center pb-2">
        <p
          className={`font-bold ${
            colorScheme == "dark" ? "text-dark" : "text-light"
          }`}
        >
          Welcome! Please authorize to continue.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2">
            {userTypesNav.map((nav, index) => (
              <TabsTrigger
                key={index}
                value={nav.value}
                className={`cursor-pointer p-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white ${
                  colorScheme == "dark" ? "bg-slate-900" : "bg-slate-300/80"
                }`}
              >
                <nav.icon className="h-4 w-4 mr-2" />
                {nav.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="student">
            <form onSubmit={handleStudentLogin} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentCredentials.id}
                  onChange={(e) =>
                    setStudentCredentials((prev) => ({
                      ...prev,
                      id: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-password">Password</Label>
                <Input
                  id="student-password"
                  type="password"
                  placeholder="Enter your password"
                  value={studentCredentials.password}
                  onChange={(e) =>
                    setStudentCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <Button type="submit" className="gradient-button w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In as Student
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 gap-2">
                {authenticationOptions.map((nav, index) => (
                  <TabsTrigger
                    key={index}
                    className={`cursor-pointer p-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white ${
                      colorScheme == "dark" ? "bg-slate-900" : "bg-slate-300/80"
                    }`}
                    value={nav.value}
                  >
                    {nav.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="Enter your email"
                      value={teacherCredentials.email}
                      onChange={(e) =>
                        setTeacherCredentials((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      placeholder="Enter your password"
                      value={teacherCredentials.password}
                      onChange={(e) =>
                        setTeacherCredentials((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button type="submit" className="gradient-button w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In as Teacher
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleTeacherSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={teacherSignup.name}
                      onChange={(e) =>
                        setTeacherSignup((prev) => ({
                          ...prev,
                          name: e.target.value,
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
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
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
                  <Button type="submit" className="gradient-button w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Teacher Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
