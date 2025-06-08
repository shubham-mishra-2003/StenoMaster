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
import { useTheme } from "@/hooks/ThemeProvider";

const ClassManagement = () => {
  const { colorScheme } = useTheme();
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
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">
            Class Management
          </h2>
          <p className={`text-sm sm:text-base ${colorScheme === "dark" ? 'text-dark' : 'text-light'}`}>
            Create and manage your classes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`gradient-button ${colorScheme === "dark" ? 'dark-gradient-button' : 'light-gradient-button'}`}>
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-sm sm:max-w-md mx-4 backdrop-blur-xl border-0 shadow-2xl ${colorScheme === "dark" ? 'modal-gradient-dark-bg' : 'modal-gradient-light-bg'}`}>
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl gradient-text font-bold">
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
                  className={`bg-white/60 border-gray-200 focus:ring-2 focus:ring-blue-500 ${colorScheme === "dark" ? 'dark:bg-gray-800/60 dark:border-gray-700' : ''}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateClass()}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className={`flex-1 border-gray-300 hover:bg-gray-50 ${colorScheme === "dark" ? 'dark:border-gray-600 dark:hover:bg-gray-800' : ''}`}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateClass}
                  className={`flex-1 gradient-button ${colorScheme === "dark" ? 'dark-gradient-button' : 'light-gradient-button'}`}
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
              className={`relative overflow-hidden backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${colorScheme === "dark" ? 'modal-gradient-dark-bg' : 'modal-gradient-light-bg'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg gradient-text">
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
                  <span className={`text-sm text-muted-foreground ${colorScheme === "dark" ? 'text-dark' : 'text-light'}`}>
                    {classStudents.length} student{classStudents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className={`${colorScheme === "dark" ? 'bg-gradient-to-r from-blue-950 to-purple-950 text-blue-300' : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'}`}
                  >
                    {classItem.assignments.length} assignment{classItem.assignments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className={`w-full border-blue-200 transition-all duration-300 ${colorScheme === "dark" ? 'dark:border-blue-800 dark:hover:from-blue-950 dark:hover:to-purple-950' : 'hover:from-blue-50 hover:to-purple-50'}`}
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
        <Card className={`relative overflow-hidden backdrop-blur-xl border-0 shadow-lg ${colorScheme === "dark" ? 'modal-gradient-dark-bg' : 'modal-gradient-light-bg'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
          <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${colorScheme === "dark" ? 'dark-gradient-button' : 'light-gradient-button'}`}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 gradient-text">
              No classes yet
            </h3>
            <p className={`text-muted-foreground text-center mb-4 max-w-sm ${colorScheme === "dark" ? 'text-dark' : 'text-light'}`}>
              Get started by creating your first class
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className={`gradient-button ${colorScheme === "dark" ? 'dark-gradient-button' : 'light-gradient-button'}`}
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