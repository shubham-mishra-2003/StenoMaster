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
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Class, Student } from "@/types";
import { Plus, Trash2, User, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";

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
  const [students, setStudents] = useLocalStorage<Student[]>(
    "stenolearn-students",
    []
  );
  const [classes] = useLocalStorage<Class[]>("stenolearn-classes", []);

  const { colorScheme } = useTheme();

  const [newStudent, setNewStudent] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const classStudents = students.filter((s) => s.classId === classItem.id);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.username.trim()) {
      toast({
        title: "Error",
        description: "Please enter student name and username.",
        variant: "destructive",
      });
      return;
    }

    const existingStudent = students.find((s) => s.id === newStudent.username);
    if (existingStudent) {
      toast({
        title: "Error",
        description:
          "Username already exists. Please choose a different username.",
        variant: "destructive",
      });
      return;
    }

    const password = newStudent.password || generateRandomPassword();

    const student: Student = {
      id: newStudent.username,
      name: newStudent.name,
      password: password,
      classId: classItem.id,
      scores: [],
      createdAt: new Date(),
    };

    setStudents((prev) => [...prev, student]);
    setNewStudent({ name: "", username: "", password: "" });

    toast({
      title: "Success",
      description: `${newStudent.name} added successfully. Username: ${newStudent.username}, Password: ${password}`,
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    toast({
      title: "Success",
      description: "Student removed successfully.",
    });
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

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
    );
    setEditingStudent(null);
    toast({
      title: "Success",
      description: "Student updated successfully.",
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
                  <Label htmlFor="student-username">
                    Username (Student ID)
                  </Label>
                  <Input
                    id="student-username"
                    placeholder="Enter username"
                    value={newStudent.username}
                    onChange={(e) =>
                      setNewStudent((prev) => ({
                        ...prev,
                        username: e.target.value,
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
                className={colorScheme == "dark" ? "text-dark" : "text-light"}
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
                  {classStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex flex-col p-4 border rounded-xl gap-3 ${
                        colorScheme == "dark"
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
                              className={`cursor-pointer border w-full sm:w-32 trauncate rounded-xl ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70 hover:bg-black/60 border-slate-700"
                                  : "bg-slate-200 hover:bg-slate-300 border-slate-300"
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={`scroll-smooth border-0 p-2 max-h-60 rounded-xl shadow-2xl ${
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
                              onClick={() => setEditingStudent(student)}
                              className={`h-9 flex-1 relative cursor-pointer ${
                                colorScheme == "dark"
                                  ? "bg-slate-900/70 hover:bg-black/60"
                                  : "bg-slate-200 hover:bg-slate-300"
                              }`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              className={`h-9 flex-1 relative text-destructive  cursor-pointer hover:text-white hover:bg-red-500 ${
                                colorScheme == "dark"
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
                          Username: {student.id} | Password: {student.password}
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

        {editingStudent && (
          <Dialog
            open={!!editingStudent}
            onOpenChange={() => setEditingStudent(null)}
          >
            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    className="w-full text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingStudent.password}
                    onChange={(e) =>
                      setEditingStudent((prev) =>
                        prev ? { ...prev, password: e.target.value } : null
                      )
                    }
                    className="w-full text-sm sm:text-base"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingStudent(null)}
                    className={`cursor-pointer border rounded-2xl ${
                      colorScheme == "dark"
                        ? "bg-slate-900 border-slate-700 hover:bg-slate-800"
                        : "bg-slate-200 border-slate-300 hover:bg-slate-300"
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStudent}
                    className="gradient-button"
                  >
                    Update Student
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentManagement;
