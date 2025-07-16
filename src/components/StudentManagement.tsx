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
import { Edit, Plus, Trash2, User2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useClass } from "@/hooks/useClasses";
import { useAuth } from "@/hooks/useAuth";
import { useScore } from "@/hooks/useScore";

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
  const { assignStudentToClass, removeStudentFromClass } = useClass();
  const { classes, fetchClassesForTeacher, fetchStudentsInClass } = useScore();
  const { createStudent, deleteAccount } = useAuth();
  const { colorScheme } = useTheme();
  const [students, setStudent] = useState<User[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState({
    fetchStudents: false,
    addingStudent: false,
    removingStudent: false,
    classChange: false,
  });
  const getToken = () => localStorage.getItem("StenoMaster-token");

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const fetchStudentInClass = async (classId: string) => {
    const token = getToken();
    if (!token) {
      setStudent([]);
      return [];
    }
    setIsLoading((prev) => ({ ...prev, fetchStudents: true }));
    try {
      const response = await fetch("/api/classes/fetch-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId, token }),
        signal: AbortSignal.timeout(5000),
      });
      const text = await response.text();
      const result = text
        ? JSON.parse(text)
        : { status: "error", message: "Empty response from server" };
      if (
        response.ok &&
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        setStudent((prevScores) => {
          const newStudents = result.data.filter(
            (newStudent: User) =>
              !prevScores.some((std) => std.userId === newStudent.userId)
          );
          return [...prevScores, ...newStudents];
        });
        console.log("Fetching students - ", students);
        return result.data;
      } else {
        setStudent([]);
        return [];
      }
    } catch (error) {
      setStudent([]);
      return [];
    } finally {
      setIsLoading((prev) => ({ ...prev, fetchStudents: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudentInClass(classItem.id);
    }
  }, []);

  const handleAddStudent = async () => {
    setIsLoading((prev) => ({ ...prev, addingStudent: true }));
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter student name and email.",
        variant: "destructive",
      });
      setIsLoading((prev) => ({ ...prev, addingStudent: false }));
      return;
    }
    const password = newStudent.password || generateRandomPassword();

    try {
      const newUser = await createStudent({
        email: newStudent.email,
        fullName: newStudent.name,
        password,
      });
      await assignStudentToClass(classItem.id, newUser.userId);
      await fetchStudentInClass(classItem.id);
      const teacherClasses: Class[] = await fetchClassesForTeacher();
      if (teacherClasses.length > 0) {
        const allStudents: User[] = [];
        for (const c of teacherClasses) {
          const students = await fetchStudentsInClass(c.id);
          allStudents.push(...students);
        }
      }
      toast({
        title: "Success",
        description: `${newStudent.name} added successfully. Email: ${newStudent.email}, Password: ${password}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    } finally {
      setNewStudent((prev) => ({
        ...prev,
        email: "",
        name: "",
        password: "",
      }));
      setIsLoading((prev) => ({ ...prev, addingStudent: false }));
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setIsLoading((prev) => ({ ...prev, removingStudent: true }));
    try {
      await removeStudentFromClass(classItem.id, studentId);
      await deleteAccount(studentId);
      await fetchClassesForTeacher();
      await fetchStudentInClass(classItem.id);
      toast({
        title: "Success",
        description: "Student removed successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, removingStudent: false }));
    }
  };

  const handleChangeClass = async (studentId: string, newClassId: string) => {
    setIsLoading((prev) => ({ ...prev, classChange: true }));
    try {
      await removeStudentFromClass(classItem.id, studentId);
      await assignStudentToClass(newClassId, studentId);
      await fetchStudentInClass(classItem.id);
      await fetchClassesForTeacher();
      toast({
        title: "Success",
        description: "Student moved to new class successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error changing class:", error);
      toast({
        title: "Error",
        description: "Failed to move student.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, classChange: false }));
    }
  };

  const isLoadingStudents =
    isLoading.addingStudent ||
    isLoading.classChange ||
    isLoading.fetchStudents ||
    isLoading.removingStudent;

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
                className={colorScheme == "dark" ? "text-dark" : "text-light"}
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
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    placeholder="Enter email"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full text-sm sm:text-base"
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
                  />
                </div>
              </div>
              <Button
                onClick={handleAddStudent}
                className="w-full gradient-button"
                disabled={isLoadingStudents}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle
                className={colorScheme == "dark" ? "text-dark" : "text-light"}
              >
                Current Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="text-center py-8">Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <User2 className="h-12 w-12 text-white mx-auto mb-4" />
                  <p
                    className={
                      colorScheme == "dark"
                        ? "text-dark-muted"
                        : "text-light-muted"
                    }
                  >
                    No students in this class yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.userId}
                      className={`flex flex-col p-4 border rounded-xl gap-3 ${
                        colorScheme == "dark"
                          ? "border-slate-500"
                          : "border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between gap-2">
                        <h4 className="font-medium truncate">
                          {student.fullName}
                        </h4>
                        <div className="flex items-center justify-between gap-1 flex-col sm:flex-row">
                          <Select
                            value={classItem.id}
                            onValueChange={(newClassId) =>
                              handleChangeClass(student.userId, newClassId)
                            }
                          >
                            <SelectTrigger
                              className={`cursor-pointer h-9 border w-full sm:w-56 truncate rounded-xl ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70 hover:bg-black/60 border-slate-700"
                                  : "bg-slate-200 hover:bg-slate-300 border-slate-300"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`scroll-smooth border-0 max-h-60 rounded-xl shadow-2xl ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70 border-slate-700 shadow-slate-500"
                                  : "bg-slate-200/80 border-slate-300"
                              }`}
                            >
                              {classes.map((cls) => (
                                <SelectItem
                                  key={cls.id}
                                  value={cls.id}
                                  className={`cursor-pointer border-2 rounded-xl mb-[2px] ${
                                    colorScheme == "dark"
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
                              disabled
                              className={`h-9 flex-1 relative cursor-not-allowed opacity-50 ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70"
                                  : "bg-slate-200"
                              }`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteStudent(student.userId)
                              }
                              className={`h-9 flex-1 relative text-destructive cursor-pointer hover:text-white hover:bg-red-500 ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70"
                                  : "bg-slate-200"
                              }`}
                              disabled={isLoadingStudents}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-col justify-center">
                        <p className="text-sm text-muted-foreground">
                          Email: {student.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          0 assignments completed
                        </p>
                      </div>
                    </div>
                  ))}
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
