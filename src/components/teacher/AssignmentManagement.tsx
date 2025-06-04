import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Assignment, Class } from "@/types";
import { Plus, Upload, FileText, Trash2, Edit, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EditAssignmentModal from "./EditAssignmentModal";
import Image from "next/image";

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>(
    "stenolearn-assignments",
    []
  );
  const [classes] = useLocalStorage<Class[]>("stenolearn-classes", []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    correctText: "",
    classId: "",
    imageFile: null as File | null,
    imageUrl: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewAssignment((prev) => ({
          ...prev,
          imageFile: file,
          imageUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAssignment = () => {
    if (
      !newAssignment.title.trim() ||
      !newAssignment.correctText.trim() ||
      !newAssignment.classId
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl =
      newAssignment.imageUrl ||
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop";

    const assignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: newAssignment.title,
      description: newAssignment.description,
      imageUrl,
      correctText: newAssignment.correctText,
      classId: newAssignment.classId,
      createdAt: new Date(),
      isActive: true,
    };

    setAssignments((prev) => [...prev, assignment]);
    setNewAssignment({
      title: "",
      description: "",
      correctText: "",
      classId: "",
      imageFile: null,
      imageUrl: "",
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Success",
      description: "Assignment created successfully.",
    });
  };

  const handleEditAssignment = (updatedAssignment: Assignment) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
    );
  };

  const toggleAssignmentStatus = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, isActive: !a.isActive } : a
      )
    );
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    toast({
      title: "Success",
      description: "Assignment deleted successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assignment Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage stenography assignments
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignment-title">Assignment Title</Label>
                    <Input
                      id="assignment-title"
                      placeholder="Enter assignment title"
                      value={newAssignment.title}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignment-description">Description</Label>
                    <Textarea
                      id="assignment-description"
                      placeholder="Enter assignment description"
                      value={newAssignment.description}
                      onChange={(e) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class-select">Select Class</Label>
                    <Select
                      value={newAssignment.classId}
                      onValueChange={(value) =>
                        setNewAssignment((prev) => ({
                          ...prev,
                          classId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Stenography Image/PDF</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        {newAssignment.imageUrl ? (
                          <div className="space-y-2">
                            <Image
                              src={newAssignment.imageUrl}
                              alt="Preview"
                              className="max-w-full h-32 object-cover mx-auto rounded"
                            />
                            <p className="text-sm text-green-600">
                              {newAssignment.imageFile?.name ||
                                "Image uploaded"}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload stenography image or PDF
                            </p>
                          </>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correct-text">Correct Text</Label>
                <Textarea
                  id="correct-text"
                  placeholder="Enter the correct text for this stenography"
                  value={newAssignment.correctText}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      correctText: e.target.value,
                    }))
                  }
                  rows={6}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {newAssignment.correctText.length} characters
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAssignment}>
                  Create Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => {
          const assignedClass = classes.find(
            (c) => c.id === assignment.classId
          );

          return (
            <Card
              key={assignment.id}
              className="glass-card hover-lift hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-lg"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {assignment.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {assignment.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignment.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={assignment.imageUrl}
                      alt={assignment.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {assignment.description}
                </p>

                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Class: {assignedClass?.name || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {assignment.correctText.length} characters
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAssignment(assignment)}
                    className="flex-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAssignmentStatus(assignment.id)}
                    className="flex-1"
                  >
                    {assignment.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAssignment(assignment.id)}
                    className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <Card className="glass-card bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-lg border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first stenography assignment
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assignment
            </Button>
          </CardContent>
        </Card>
      )}

      <EditAssignmentModal
        assignment={editingAssignment}
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        onSave={handleEditAssignment}
        classes={classes}
      />
    </div>
  );
};

export default AssignmentManagement;
