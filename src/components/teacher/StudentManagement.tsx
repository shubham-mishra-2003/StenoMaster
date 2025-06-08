import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const StudentManagement = ({ classItem, isOpen, onClose }: StudentManagementProps) => {
  const { colorScheme } = useTheme();
  const [students, setStudents] = useLocalStorage<Student[]>("stenolearn-students", []);
  const [classes] = useLocalStorage<Class[]>("stenolearn-classes", []);
  const [newStudent, setNewStudent] = useState({ name: "", username: "", password: "" });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const classStudents = students.filter(s => s.classId === classItem.id);

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

    const existingStudent = students.find(s => s.id === newStudent.username);
    if (existingStudent) {
      toast({
        title: "Error",
        description: "Username already exists. Please choose a different username.",
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

    setStudents(prev => [...prev, student]);
    setNewStudent({ name: "", username: "", password: "" });
    
    toast({
      title: "Success",
      description: `Student ${newStudent.name} added successfully. Username: ${newStudent.username}, Password: ${password}`,
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({
      title: "Success",
      description: "Student removed successfully.",
    });
  };

  const handleChangeClass = (studentId: string, newClassId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, classId: newClassId } : s
    ));
    toast({
      title: "Success",
      description: "Student moved to new class successfully.",
    });
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    setStudents(prev => prev.map(s => 
      s.id === editingStudent.id ? editingStudent : s
    ));
    setEditingStudent(null);
    toast({
      title: "Success",
      description: "Student updated successfully.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br ${colorScheme === "dark" ? "modal-gradient-dark-bg" : "modal-gradient-light-bg"} backdrop-blur-xl border-0 shadow-2xl`}>
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text font-bold">Manage Students - {classItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card className={`bg-gradient-to-br ${colorScheme === "dark" ? "modal-gradient-dark-bg" : "modal-gradient-light-bg"} backdrop-blur-xl border-0 shadow-lg`}>
            <CardHeader>
              <CardTitle className="text-xl gradient-text font-bold">Add New Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name" className={`text-sm font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Student Name</Label>
                  <Input
                    id="student-name"
                    placeholder="Enter student name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    className={`${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === "Enter" && handleAddStudent()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-username" className={`text-sm font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Username (Student ID)</Label>
                  <Input
                    id="student-username"
                    placeholder="Enter username"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, username: e.target.value }))}
                    className={`${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === "Enter" && handleAddStudent()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password" className={`text-sm font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Password (optional)</Label>
                  <Input
                    id="student-password"
                    placeholder="Auto-generated if empty"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                    className={`${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === "Enter" && handleAddStudent()}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddStudent} 
                className={`w-full gradient-button ${colorScheme === "dark" ? "dark-gradient-button" : "light-gradient-button"}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${colorScheme === "dark" ? "modal-gradient-dark-bg" : "modal-gradient-light-bg"} backdrop-blur-xl border-0 shadow-lg`}>
            <CardHeader>
              <CardTitle className="text-xl gradient-text font-bold">Current Students ({classStudents.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {classStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className={`h-12 w-12 ${colorScheme === "dark" ? "text-dark" : "text-light"}`} />
                  <p className={`text-sm ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>No students in this class yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-br ${colorScheme === "dark" ? "modal-gradient-dark-bg" : "modal-gradient-light-bg"} backdrop-blur-xl shadow-lg hover:bg-gradient-to-r ${colorScheme === "dark" ? "hover:from-blue-600/50 hover:via-purple-600/50 hover:to-indigo-950/50" : "hover:from-blue-200 hover:via-purple-200 hover:to-indigo-50"} transition-all duration-300 hover:shadow-md`}
                    >
                      <div className="flex-1">
                        <h4 className={`text-base font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>{student.name}</h4>
                        <p className={`text-sm ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>
                          Username: {student.id} | Password: {student.password}
                        </p>
                        <p className={`text-sm ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>
                          {student.scores.length} assignments completed
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={student.classId}
                          onValueChange={(newClassId) => handleChangeClass(student.id, newClassId)}
                        >
                          <SelectTrigger className={`w-32 ${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(student)}
                          className={`w-10 h-10 gradient-button rounded-lg flex items-center justify-center ${colorScheme === "dark" ? "dark-gradient-button" : "light-gradient-button"}`}
                        >
                          <Edit className="h-4 w-4 text-white" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className={`w-10 h-10 gradient-button rounded-lg flex items-center justify-center ${colorScheme === "dark" ? "dark-gradient-button" : "light-gradient-button"}`}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {editingStudent && (
          <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
            <DialogContent className={`sm:max-w-md bg-gradient-to-br ${colorScheme === "dark" ? "modal-gradient-dark-bg" : "modal-gradient-light-bg"} backdrop-blur-xl border-0 shadow-2xl`}>
              <DialogHeader>
                <DialogTitle className="text-xl gradient-text font-bold">Edit Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className={`text-sm font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Name</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className={`${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === "Enter" && handleUpdateStudent()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password" className={`text-sm font-medium ${colorScheme === "dark" ? "text-dark" : "text-light"}`}>Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingStudent.password}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, password: e.target.value } : null)}
                    className={`${colorScheme === "dark" ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} focus:ring-2 focus:ring-blue-500`}
                    onKeyPress={(e) => e.key === "Enter" && handleUpdateStudent()}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingStudent(null)}
                    className={`flex-1 ${colorScheme === "dark" ? "border-gray-600 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"}`}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateStudent} 
                    className={`flex-1 gradient-button ${colorScheme === "dark" ? "dark-gradient-button" : "light-gradient-button"}`}
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