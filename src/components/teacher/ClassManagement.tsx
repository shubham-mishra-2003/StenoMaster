
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Class, Student } from "@/types";
import { Plus, Users, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import StudentManagement from "./StudentManagement";

const ClassManagement = () => {
  const [classes, setClasses] = useLocalStorage<Class[]>("stenolearn-classes", []);
  const [students] = useLocalStorage<Student[]>("stenolearn-students", []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name.",
        variant: "destructive",
      });
      return;
    }

    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: newClassName,
      teacherId: "teacher-1",
      students: [],
      assignments: [],
      createdAt: new Date(),
    };

    setClasses(prev => [...prev, newClass]);
    setNewClassName("");
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Class created successfully.",
    });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    toast({
      title: "Success",
      description: "Class deleted successfully.",
    });
  };

  const getClassStudents = (classId: string) => {
    return students.filter(s => s.classId === classId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Class Management
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage your classes</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-md mx-4 bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 dark:from-gray-900/95 dark:via-blue-950/90 dark:to-purple-950/95 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                Create New Class
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="class-name" className="text-sm font-medium">Class Name</Label>
                <Input
                  id="class-name"
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateClass()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateClass}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classItem) => {
          const classStudents = getClassStudents(classItem.id);
          
          return (
            <Card 
              key={classItem.id} 
              className="relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-700/40 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {classItem.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {classStudents.length} student{classStudents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-950 dark:to-purple-950 dark:text-blue-300"
                  >
                    {classItem.assignments.length} assignment{classItem.assignments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:border-blue-800 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300"
                  onClick={() => setSelectedClass(classItem)}
                >
                  Manage Students
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {classes.length === 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-700/40 backdrop-blur-xl border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              No classes yet
            </h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Get started by creating your first class
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export default ClassManagement;
