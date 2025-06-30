"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class, User } from "@/types";
import { Plus, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";

interface StudentManagementProps {
  classItem: Class;
  isOpen: boolean;
  onClose: () => void;
}

const StudentManagement = ({
  classItem,
  isOpen,
  onClose,
}: StudentManagementProps) => {
  const { colorScheme } = useTheme();
  const { createStudent, deleteAccount, isAuthenticated, user } = useAuth();
  const { classes, assignStudentToClass, removeStudentFromClass, loading } =
    useClasses();
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [studentDetails, setStudentDetails] = useState<User[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  // Fetch student details for display
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (
        !isAuthenticated ||
        user?.userType !== "teacher" ||
        !classItem.students.length
      ) {
        setStudentDetails([]);
        return;
      }

      setFetchingStudents(true);
      try {
        const token = localStorage.getItem("StenoMaster-token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        console.log(
          "[StudentManagement] Fetching student details for userIds:",
          classItem.students
        );
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: classItem.students }),
        });

        const result = await response.json();
        console.log("[StudentManagement] GET /api/users response:", result);
        if (response.ok && result.status === "success") {
          setStudentDetails(result.data as User[]);
        } else {
          throw new Error(result.message || "Failed to fetch student details");
        }
      } catch (error) {
        console.error(
          "[StudentManagement] Error fetching student details:",
          error
        );
        toast({
          title: "Error",
          description: "Failed to load student details.",
          variant: "destructive",
        });
        setStudentDetails([]);
      } finally {
        setFetchingStudents(false);
      }
    };

    fetchStudentDetails();
  }, [classItem.students, isAuthenticated, user]);

  const handleAddStudent = async () => {
    if (!isAuthenticated || user?.userType !== "teacher") {
      toast({
        title: "Error",
        description: "Only teachers can add students.",
        variant: "destructive",
      });
      return;
    }

    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter student name and email.",
        variant: "destructive",
      });
      return;
    }

    const password = newStudent.password || generateRandomPassword();

    try {
      // Create student in MongoDB and get user data
      console.log("[StudentManagement] Creating student:", {
        email: newStudent.email,
        fullName: newStudent.name,
      });
      const newUser = await createStudent({
        email: newStudent.email,
        fullName: newStudent.name,
        password,
      });

      // Assign student to class in Firestore
      console.log("[StudentManagement] Assigning student to class:", {
        classId: classItem.id,
        studentId: newUser.userId,
      });
      await assignStudentToClass(classItem.id, newUser.userId);

      setNewStudent({ name: "", email: "", password: "" });
      toast({
        title: "Success",
        description: `${newStudent.name} added successfully. Email: ${newStudent.email}, Password: ${password}`,
      });
    } catch (error) {
      console.error("[StudentManagement] Error adding student:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!isAuthenticated || user?.userType !== "teacher") {
      toast({
        title: "Error",
        description: "Only teachers can remove students.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[StudentManagement] Removing student from class:", {
        classId: classItem.id,
        studentId,
      });
      // Remove student from class in Firestore
      await removeStudentFromClass(classItem.id, studentId);
      console.log("[StudentManagement] Deleting student account:", studentId);
      // Delete student from MongoDB
      await deleteAccount(studentId);
      toast({
        title: "Success",
        description: "Student removed successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeClass = async (studentId: string, newClassId: string) => {
    if (!isAuthenticated || user?.userType !== "teacher") {
      toast({
        title: "Error",
        description: "Only teachers can move students.",
        variant: "destructive",
      });
      return;
    }

    if (newClassId === classItem.id) {
      toast({
        title: "Error",
        description: "Student is already in this class.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[StudentManagement] Moving student:", {
        studentId,
        fromClass: classItem.id,
        toClass: newClassId,
      });
      await removeStudentFromClass(classItem.id, studentId);
      await assignStudentToClass(newClassId, studentId);
      toast({
        title: "Success",
        description: "Student moved to new class successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error changing class:", error);
      toast({
        title: "Error",
        description: "Failed to move student. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Manage Students - {classItem.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle
                className={colorScheme === "dark" ? "text-dark" : "text-light"}
              >
                Add New Student
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    id="student-name"
                    placeholder="Enter student name"
                    value={newStudent.name}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full text-sm sm:text-base"
                    disabled={
                      loading ||
                      !isAuthenticated ||
                      user?.userType !== "teacher"
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="Enter student email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full text-sm sm:text-base"
                    disabled={
                      loading ||
                      !isAuthenticated ||
                      user?.userType !== "teacher"
                    }
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="student-password">Password (optional)</Label>
                  <Input
                    id="student-password"
                    placeholder="Auto-generated if empty"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full text-sm sm:text-base"
                    disabled={
                      loading ||
                      !isAuthenticated ||
                      user?.userType !== "teacher"
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleAddStudent}
                className="w-full gradient-button"
                disabled={
                  loading || !isAuthenticated || user?.userType !== "teacher"
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle
                className={colorScheme === "dark" ? "text-dark" : "text-light"}
              >
                Current Students ({classItem.students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fetchingStudents && (
                <div className="text-center py-8">Loading students...</div>
              )}
              {!fetchingStudents && classItem.students.length === 0 && (
                <div className="text-center py-8">
                  <UserIcon className="h-12 w-12 text-white mx-auto mb-4" />
                  <p
                    className={
                      colorScheme === "dark"
                        ? "text-dark-muted"
                        : "text-light-muted"
                    }
                  >
                    No students in this class yet
                  </p>
                </div>
              )}
              {!fetchingStudents && classItem.students.length > 0 && (
                <div className="space-y-3">
                  {classItem.students.map((studentId) => {
                    const student = studentDetails.find(
                      (s) => s.userId === studentId
                    );
                    return (
                      <div
                        key={studentId}
                        className={`flex flex-col p-4 border rounded-xl gap-3 ${
                          colorScheme === "dark"
                            ? "border-slate-500"
                            : "border-slate-300"
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <h4 className="font-medium truncate">
                            {student?.fullName || "Unknown"}
                          </h4>
                          <div className="flex items-center justify-between gap-1 flex-col sm:flex-row">
                            <Select
                              value={classItem.id}
                              onValueChange={(newClassId) =>
                                handleChangeClass(studentId, newClassId)
                              }
                              disabled={
                                loading ||
                                !isAuthenticated ||
                                user?.userType !== "teacher"
                              }
                            >
                              <SelectTrigger
                                className={`cursor-pointer border w-full sm:w-32 truncate rounded-xl ${
                                  colorScheme === "dark"
                                    ? "bg-slate-900/70 hover:bg-black/60 border-slate-700"
                                    : "bg-slate-200 hover:bg-slate-300 border-slate-300"
                                }`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                className={`scroll-smooth border-0 p-2 max-h-60 rounded-xl shadow-2xl ${
                                  colorScheme === "dark"
                                    ? "bg-slate-900/70 border-slate-700 shadow-slate-500"
                                    : "bg-slate-200/80 border-slate-300"
                                }`}
                              >
                                {classes.map((cls) => (
                                  <SelectItem
                                    key={cls.id}
                                    value={cls.id}
                                    className={`cursor-pointer border-2 rounded-xl mb-[2px] ${
                                      colorScheme === "dark"
                                        ? "bg-slate-700 border-slate-600"
                                        : "bg-slate-200 border-slate-300"
                                    }`}
                                  >
                                    {cls.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1 justify-between w-full">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteStudent(student?.userId || "")
                                }
                                className={`h-9 flex-1 relative text-destructive cursor-pointer hover:text-white hover:bg-red-500 ${
                                  colorScheme === "dark"
                                    ? "bg-slate-900/70"
                                    : "bg-slate-200"
                                }`}
                                disabled={
                                  loading ||
                                  !isAuthenticated ||
                                  user?.userType !== "teacher"
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-col justify-center">
                          <p className="text-sm text-muted-foreground">
                            Email: {student?.email || "Unknown"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentManagement;
