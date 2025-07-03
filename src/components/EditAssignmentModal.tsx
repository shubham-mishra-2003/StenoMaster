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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Assignment, Class } from "@/types";
import { Upload, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAssignment } from "@/hooks/useAssignments";
import Datetime from "react-datetime";
import moment from "moment";
import "react-datetime/css/react-datetime.css";

interface EditAssignmentModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAssignment: Assignment) => void;
  classes: Class[];
}

const EditAssignmentModal = ({
  assignment,
  isOpen,
  onClose,
  onSave,
  classes,
}: EditAssignmentModalProps) => {
  const { updateAssignment, loading } = useAssignment();
  const { colorScheme } = useTheme();
  const [editForm, setEditForm] = useState({
    title: assignment?.title || "",
    deadlineStart: null as Date | null,
    deadlineEnd: null as Date | null,
    correctText: assignment?.correctText || "",
    classId: assignment?.classId || "",
    imageFile: null as File | null,
    imageUrl: assignment?.imageUrl || "",
  });

  useEffect(() => {
    if (assignment) {
      const [start, end] = assignment.deadline
        ? assignment.deadline.split(" to ").map((d) => moment(d, "DD/MM/YYYY, HH:mm").toDate())
        : [new Date(), new Date()];
      setEditForm({
        title: assignment.title,
        deadlineStart: start,
        deadlineEnd: end,
        correctText: assignment.correctText,
        classId: assignment.classId,
        imageFile: null,
        imageUrl: assignment.imageUrl,
      });
    }
  }, [assignment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = async () => {
    if (
      !assignment ||
      !editForm.title.trim() ||
      !editForm.correctText.trim() ||
      !editForm.classId ||
      !editForm.deadlineStart ||
      !editForm.deadlineEnd
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields, including deadline range.",
        variant: "destructive",
      });
      return;
    }

    if (editForm.deadlineEnd <= editForm.deadlineStart) {
      toast({
        title: "Error",
        description: "End date and time must be after start date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedDeadline = `${moment(editForm.deadlineStart).format("DD/MM/YYYY, HH:mm")} to ${moment(editForm.deadlineEnd).format("DD/MM/YYYY, HH:mm")}`;
      await updateAssignment(assignment.id, {
        title: editForm.title,
        deadline: updatedDeadline,
        correctText: editForm.correctText,
        classId: editForm.classId,
        imageFile: editForm.imageFile,
        imageUrl: editForm.imageUrl,
      });
      onSave({
        ...assignment,
        title: editForm.title,
        deadline: updatedDeadline,
        correctText: editForm.correctText,
        classId: editForm.classId,
        imageUrl: editForm.imageUrl,
      });
      onClose();
    } catch (err) {
      // Error handled by hook's toast
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Assignment</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Assignment Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline-range">Set a deadline time</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Datetime
                    value={editForm.deadlineStart ?? undefined}
                    onChange={(value) => {
                      const date = moment(value).isValid() ? moment(value).toDate() : null;
                      setEditForm((prev) => ({
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
                    value={editForm.deadlineEnd ?? undefined}
                    onChange={(value) => {
                      const date = moment(value).isValid() ? moment(value).toDate() : null;
                      setEditForm((prev) => ({
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
                <Label htmlFor="edit-class">Select Class</Label>
                <Select
                  value={editForm.classId}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, classId: value }))
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-image-upload">Update Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Label htmlFor="edit-image-upload" className="cursor-pointer">
                    {editForm.imageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={editForm.imageUrl}
                          alt="Preview"
                          className="max-w-full h-32 object-cover mx-auto rounded"
                        />
                        <p className="text-sm text-green-600">
                          {editForm.imageFile?.name || "Current image"}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload new image
                        </p>
                      </>
                    )}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-correct-text">Correct Text</Label>
            <Textarea
              id="edit-correct-text"
              value={editForm.correctText}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  correctText: e.target.value,
                }))
              }
              rows={6}
              className="font-mono"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {editForm.correctText.length} characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentModal;