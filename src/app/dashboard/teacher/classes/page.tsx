"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Class, User } from "@/types";
import { Plus, Users, Trash2 } from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import { useTheme } from "@/hooks/ThemeProvider";
import { useClass } from "@/hooks/useClasses";
import { useScore } from "@/hooks/useScore";
import { useAssignment } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";

const ClassPage = () => {
  const { createClass, deleteClass } = useClass();
  const { classes, fetchClassesForTeacher } = useScore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { colorScheme } = useTheme();
  const { assignments, deleteStudentScores, fetchStudentsInClass } = useScore();
  const { deleteAssignment } = useAssignment();
  const { deleteAccount } = useAuth();
  const [classLoading, setClassLoading] = useState({
    create: false,
    delete: false,
  });

  const handleCreateClass = async () => {
    setClassLoading((prev) => ({ ...prev, create: true }));
    try {
      setTimeout(() => {
        setIsCreateDialogOpen(false);
      }, 1000);
      await createClass(newClassName);
      setNewClassName("");
      await fetchClassesForTeacher();
    } finally {
      setClassLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const handleDelete = async (classItem: Class) => {
    setClassLoading((prev) => ({ ...prev, delete: true }));
    try {
      await deleteClass(classItem.id);
      const assignmentsToDelete = assignments.filter(
        (a) => a.classId === classItem.id
      );
      await Promise.all(assignmentsToDelete.map((a) => deleteAssignment(a.id)));
      await Promise.all(
        classItem.students.flatMap((studentId) => [
          deleteStudentScores(studentId),
          deleteAccount(studentId),
        ])
      );
      fetchClassesForTeacher();
    } catch (error) {
      console.error("Error deleting class and its data:", error);
    } finally {
      setClassLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClose = async () => {
    const teacherClasses: Class[] = await fetchClassesForTeacher();
    if (teacherClasses.length > 0) {
      const allStudents: User[] = [];
      for (const c of teacherClasses) {
        const students = await fetchStudentsInClass(c.id);
        allStudents.push(...students);
      }
    }
    setSelectedClass(null);
  };

  const isLoading = classLoading.create || classLoading.delete;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">
            Class Management
          </h2>
          <p
            className={`text-sm sm:text-base font-semibold ${
              colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
            } `}
          >
            Create and manage your classes
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold gradient-text">
                Create New Class
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-name" className="text-sm font-medium">
                  Class Name
                </Label>
                <Input
                  id="class-name"
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className={`focus:ring-2 focus:ring-blue-500 border-2 ${
                    colorScheme == "dark"
                      ? "border-gray-700 bg-gray-800/60"
                      : "bg-white/60 border-gray-300"
                  }`}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateClass()}
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className={`flex-1 cursor-pointer rounded-2xl ${
                    colorScheme == "dark"
                      ? "border-gray-600 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateClass}
                  className="flex-1 gradient-button"
                  disabled={isLoading}
                >
                  Create Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="animate-bounce">
          <CardContent className="flex flex-col gap-2 items-center justify-center p-20 h-full">
            <p
              className={`text-lg font-bold ${
                colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
              }`}
            >
              Loading Classes...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Card key={classItem.id}>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg gradient-text">
                    {classItem.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(classItem)}
                    className="text-destructive hover:text-destructive cursor-pointer hover:bg-red-500 hover:text-white"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {classItem.students.length} student
                    {classItem.students.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={`bg-gradient-to-r text-sm font-bold ${
                      colorScheme == "dark"
                        ? "text-blue-300 from-blue-900 to-purple-900"
                        : "text-blue-700 from-blue-100 to-purple-100"
                    } `}
                  >
                    {classItem.assignments.length} assignment
                    {classItem.assignments.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full gradient-button"
                  onClick={() => setSelectedClass(classItem)}
                  disabled={isLoading}
                >
                  Manage Students
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {classes.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 gradient-text">
              No classes yet
            </h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Get started by creating your first class
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gradient-button"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedClass && (
        <StudentManagement
          classItem={selectedClass}
          isOpen={!!selectedClass}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default ClassPage;
