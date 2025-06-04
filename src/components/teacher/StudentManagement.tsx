
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

interface StudentManagementProps {
  classItem: Class;
  isOpen: boolean;
  onClose: () => void;
}

const StudentManagement = ({ classItem, isOpen, onClose }: StudentManagementProps) => {
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

    // Check if username already exists
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Students - {classItem.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    id="student-name"
                    placeholder="Enter student name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="student-username">Username (Student ID)</Label>
                  <Input
                    id="student-username"
                    placeholder="Enter username"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="student-password">Password (optional)</Label>
                  <Input
                    id="student-password"
                    placeholder="Auto-generated if empty"
                    type="password"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAddStudent} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Students ({classStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students in this class yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Username: {student.id} | Password: {student.password}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.scores.length} assignments completed
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={student.classId}
                          onValueChange={(newClassId) => handleChangeClass(student.id, newClassId)}
                        >
                          <SelectTrigger className="w-32">
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editingStudent.password}
                    onChange={(e) => setEditingStudent(prev => prev ? { ...prev, password: e.target.value } : null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingStudent(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateStudent}>
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
