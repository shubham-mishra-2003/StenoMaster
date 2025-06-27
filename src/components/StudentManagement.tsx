"use client";

import React, { useState } from "react";
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
import { Class, Student } from "@/types";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

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
  const { createStudent, deleteAccount } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
  });

  const classStudents = students.filter((s) => s.classId === classItem.id);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleAddStudent = async () => {
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
      await createStudent({
        email: newStudent.email,
        fullName: newStudent.name,
        password,
      });

      const student: Student = {
        id: newStudent.email,
        name: newStudent.name,
        password,
        classId: classItem.id,
        scores: [],
        createdAt: new Date(),
      };

      setStudents((prev) => [...prev, student]);
      setNewStudent({ name: "", email: "", password: "" });

      toast({
        title: "Success",
        description: `${newStudent.name} added successfully. Email: ${newStudent.email}, Password: ${password}`,
      });
    } catch (error) {
      console.error("[StudentManagement] Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteAccount(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast({
        title: "Success",
        description: "Student removed successfully.",
      });
    } catch (error) {
      console.error("[StudentManagement] Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangeClass = (studentId: string, newClassId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, classId: newClassId } : s))
    );
    toast({
      title: "Success",
      description: "Student moved to new class successfully.",
    });
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
                Current Students ({classStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-white mx-auto mb-4" />
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
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex flex-col p-4 border rounded-xl gap-3 ${
                        colorScheme === "dark"
                          ? "border-slate-500"
                          : "border-slate-300"
                      }`}
                    >
                      <div className="flex justify-between gap-2">
                        <h4 className="font-medium truncate">{student.name}</h4>
                        <div className="flex items-center justify-between gap-1 flex-col sm:flex-row">
                          <Select
                            value={student.classId}
                            onValueChange={(newClassId) =>
                              handleChangeClass(student.id, newClassId)
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
                              {/* {classes.map((cls) => (
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
                              ))} */}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1 justify-between w-full">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className={`h-9 flex-1 relative text-destructive cursor-pointer hover:text-white hover:bg-red-500 ${
                                colorScheme === "dark"
                                  ? "bg-slate-900/70"
                                  : "bg-slate-200"
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-col justify-center">
                        <p className="text-sm text-muted-foreground">
                          Email: {student.id} | Password: {student.password}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.scores.length} assignments completed
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
