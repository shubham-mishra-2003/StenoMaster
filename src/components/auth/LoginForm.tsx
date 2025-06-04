
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { LogIn, UserPlus, GraduationCap, BookOpen } from "lucide-react";

const LoginForm = () => {
  const { login } = useAuth();
  const [studentCredentials, setStudentCredentials] = useState({ id: "", password: "" });
  const [teacherCredentials, setTeacherCredentials] = useState({ email: "", password: "" });
  const [teacherSignup, setTeacherSignup] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [activeTab, setActiveTab] = useState("student");

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

    // Mock authentication - in real app, verify against backend
    const user: User = {
      id: studentCredentials.id,
      name: `Student ${studentCredentials.id}`,
      email: `${studentCredentials.id}@student.stenolearn.com`,
      type: "student",
    };

    login(user);
    toast({
      title: "Welcome!",
      description: `Logged in as ${user.name}`,
    });
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherCredentials.email.trim() || !teacherCredentials.password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    // Mock authentication
    const user: User = {
      id: teacherCredentials.email,
      name: "Teacher",
      email: teacherCredentials.email,
      type: "teacher",
    };

    login(user);
    toast({
      title: "Welcome!",
      description: `Logged in as ${user.name}`,
    });
  };

  const handleTeacherSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacherSignup.name.trim() || !teacherSignup.email.trim() || 
        !teacherSignup.password.trim() || !teacherSignup.confirmPassword.trim()) {
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

    // Mock signup - in real app, create account in backend
    const user: User = {
      id: teacherSignup.email,
      name: teacherSignup.name,
      email: teacherSignup.email,
      type: "teacher",
    };

    login(user);
    toast({
      title: "Account Created!",
      description: `Welcome to StenoLearn, ${user.name}!`,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card border-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          StenoLearn
        </CardTitle>
        <p className="text-muted-foreground">Welcome back! Please sign in to continue.</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
            <TabsTrigger value="student" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentCredentials.id}
                  onChange={(e) => setStudentCredentials(prev => ({ ...prev, id: e.target.value }))}
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
                  onChange={(e) => setStudentCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In as Student
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                      onChange={(e) => setTeacherCredentials(prev => ({ ...prev, email: e.target.value }))}
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
                      onChange={(e) => setTeacherCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In as Teacher
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleTeacherSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={teacherSignup.name}
                      onChange={(e) => setTeacherSignup(prev => ({ ...prev, name: e.target.value }))}
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
                      onChange={(e) => setTeacherSignup(prev => ({ ...prev, email: e.target.value }))}
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
                      onChange={(e) => setTeacherSignup(prev => ({ ...prev, password: e.target.value }))}
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
                      onChange={(e) => setTeacherSignup(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-background/50 border-muted focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium">
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
