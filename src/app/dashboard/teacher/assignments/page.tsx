"use client";

import React, { useState, useEffect } from "react";
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
import { Assignment, Class } from "@/types";
import {
  Plus,
  Upload,
  FileText,
  Image,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import EditAssignmentModal from "@/components/EditAssignmentModal";
import { useAssignment } from "@/hooks/useAssignments";
import { useClass } from "@/hooks/useClasses";
import Datetime from "react-datetime";
import moment from "moment";
import "react-datetime/css/react-datetime.css";

const AssignmentPage = () => {
  const {
    assignments,
    loading,
    fetchAssignments,
    createAssignment,
    toggleAssignmentStatus,
    deleteAssignment,
    updateAssignment,
  } = useAssignment();
  const { classes, fetchClasses } = useClass();
  const { colorScheme } = useTheme();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    deadlineStart: null as Date | null,
    deadlineEnd: null as Date | null,
    correctText: "",
    classId: "",
    imageFile: null as File | null,
    imageUrl: "",
  });

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, [fetchAssignments, fetchClasses]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAssignment((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleCreateAssignment = async () => {
    if (
      !newAssignment.title.trim() ||
      !newAssignment.correctText.trim() ||
      !newAssignment.classId ||
      !newAssignment.deadlineStart ||
      !newAssignment.deadlineEnd
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields, including deadline range.",
        variant: "destructive",
      });
      return;
    }

    if (newAssignment.deadlineEnd <= newAssignment.deadlineStart) {
      toast({
        title: "Error",
        description: "End date and time must be after start date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAssignment({
        ...newAssignment,
        deadline: `${moment(newAssignment.deadlineStart).format("DD/MM/YYYY, HH:mm")} to ${moment(newAssignment.deadlineEnd).format("DD/MM/YYYY, HH:mm")}`,
      });
      setNewAssignment({
        title: "",
        deadlineStart: null,
        deadlineEnd: null,
        correctText: "",
        classId: "",
        imageFile: null,
        imageUrl: "",
      });
      setIsCreateDialogOpen(false);
    } catch (err) {
      // Error handled by hook's toast
    }
  };

  const handleEditAssignment = async (updatedAssignment: Assignment) => {
    try {
      await updateAssignment(updatedAssignment.id, {
        title: updatedAssignment.title,
        deadline: updatedAssignment.deadline,
        correctText: updatedAssignment.correctText,
        classId: updatedAssignment.classId,
        imageUrl: updatedAssignment.imageUrl,
      });
      setEditingAssignment(null);
    } catch (err) {
      // Error handled by hook's toast
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            Assignment Management
          </h2>
          <p className={`text-${colorScheme}-muted`}>
            Create and manage stenography assignments
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto`}>
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
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline-range">Set a deadline time</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Datetime
                        value={newAssignment.deadlineStart ?? undefined}
                        onChange={(value) => {
                          const date = moment(value).isValid() ? moment(value).toDate() : null;
                          setNewAssignment((prev) => ({
                            ...prev,
                            deadlineStart: date,
                          }));
                        }}
                        inputProps={{
                          id: "deadline-start",
                          placeholder: "DD/MM/YYYY, HH:mm",
                          className: `w-full h-12 px-3 font-normal rounded-xl border-2 ${
                            colorScheme === "dark"
                              ? "border-slate-500 shadow-slate-950 bg-slate-800 text-white"
                              : "border-slate-400 shadow-slate-400 bg-white text-black"
                          }`,
                          disabled: loading,
                        }}
                        dateFormat="DD/MM/YYYY"
                        timeFormat="HH:mm"
                        className="flex-1"
                      />
                      <span className="self-center text-muted-foreground">to</span>
                      <Datetime
                        value={newAssignment.deadlineEnd ?? undefined}
                        onChange={(value) => {
                          const date = moment(value).isValid() ? moment(value).toDate() : null;
                          setNewAssignment((prev) => ({
                            ...prev,
                            deadlineEnd: date,
                          }));
                        }}
                        inputProps={{
                          id: "deadline-end",
                          placeholder: "DD/MM/YYYY, HH:mm",
                          className: `w-full h-12 px-3 font-normal rounded-xl border-2 ${
                            colorScheme === "dark"
                              ? "border-slate-500 shadow-slate-950 bg-slate-800 text-white"
                              : "border-slate-400 shadow-slate-400 bg-white text-black"
                          }`,
                          disabled: loading,
                        }}
                        dateFormat="DD/MM/YYYY"
                        timeFormat="HH:mm"
                        className="flex-1"
                      />
                    </div>
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
                      disabled={loading}
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

                <div className="space-y-4 h-full">
                  <div className="space-y-2 h-full">
                    <Label htmlFor="image-upload">
                      Stenography Image (optional)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg text-center h-full flex justify-center">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer p-6 size-full"
                      >
                        {newAssignment.imageUrl ? (
                          <div className="space-y-2 flex items-center justify-center flex-col size-full">
                            <img
                              src={newAssignment.imageUrl}
                              alt="Preview"
                              className="max-w-full h-32 object-cover rounded"
                            />
                            <p className="text-sm text-green-600">
                              {newAssignment.imageFile?.name || "Image uploaded"}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload stenography image
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
                  placeholder=" permanecerá en la memoria de la humanidad por generaciones."
                  value={newAssignment.correctText}
                  onChange={(e) =>
                    setNewAssignment((prev) => ({
                      ...prev,
                      correctText: e.target.value,
                    }))
                  }
                  rows={10}
                  className="font-mono min-h-56"
                  disabled={loading}
                />
                <p className={`text-xs text-${colorScheme}-muted`}>
                  {newAssignment.correctText.length} characters
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className={`cursor-pointer border rounded-2xl text-[12px] sm:text-[14px] px-6 sm:px-8 py-4 ${
                    colorScheme === "dark"
                      ? "bg-slate-900 border-slate-700 hover:bg-slate-800"
                      : "bg-slate-200 border-slate-300 hover:bg-slate-300"
                  }`}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAssignment}
                  className="gradient-button"
                  disabled={loading}
                >
                  Create Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <Card className={`gradient-card-${colorScheme}`}>
          <CardContent className="flex justify-center py-12">
            <p>Loading assignments...</p>
          </CardContent>
        </Card>
      )}

      {!loading && assignments.length === 0 && (
        <Card
          className={`gradient-card-cta-${colorScheme} backdrop-blur-lg border-0`}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments yet</h3>
            <p className={`text-${colorScheme}-muted text-center mb-4`}>
              Create your first stenography assignment
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gradient-button"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Assignment
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && assignments.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ minWidth: '250px' }}>
          {assignments.map((assignment) => {
            const assignedClass = classes.find(
              (c) => c.id === assignment.classId
            );

            return (
              <Card
                key={assignment.id}
                className={`gradient-card-${colorScheme}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg gradient-text">
                      {assignment.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.isActive
                            ? colorScheme === "dark"
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-800"
                            : colorScheme === "dark"
                            ? "bg-gray-800 text-gray-200"
                            : "bg-gray-100 text-gray-800"
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
                      <img
                        src={assignment.imageUrl}
                        alt={assignment.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <FileText
                      className={`h-4 w-4 ${
                        colorScheme === "dark"
                          ? "text-dark-muted"
                          : "text-light-muted"
                      }`}
                    />
                    <span className="text-sm">
                      Class: {assignedClass?.name || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm text-${colorScheme}-muted`}>
                      {assignment.correctText.length} characters
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAssignment(assignment)}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950"
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAssignmentStatus(assignment.id)}
                      className="flex-1"
                      disabled={loading}
                    >
                      {assignment.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                      className="text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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

export default AssignmentPage;