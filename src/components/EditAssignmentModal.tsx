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
import { Upload, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAssignment } from "@/hooks/useAssignments";
import { Calendar24 } from "@/components/ui/calendar";
import moment from "moment";
import { useScore } from "@/hooks/useScore";

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
    deadline: undefined as Date | undefined,
    correctText: assignment?.correctText || "",
    classId: assignment?.classId || "",
    imageFile: null as File | null,
    imageUrl: assignment?.imageUrl || "",
  });
  const { assignments, fetchAssignments } = useScore();

  useEffect(() => {
    if (assignment) {
      const deadline = assignment.deadline
        ? moment(assignment.deadline, "DD/MM/YYYY, HH:mm").toDate()
        : undefined;
      setEditForm({
        title: assignment.title,
        deadline,
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
      !editForm.deadline
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields, including deadline.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedDeadline = moment(editForm.deadline).format(
        "DD/MM/YYYY, HH:mm"
      );
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
      fetchAssignments();
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
          <DialogTitle>Edit Assignment</DialogTitle>
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
                <Label htmlFor="deadline">Set deadline</Label>
                <Calendar24
                  value={editForm.deadline}
                  onChange={(date: Date | undefined, time: string) => {
                    if (date) {
                      const [hours, minutes, seconds] = time
                        .split(":")
                        .map(Number);
                      const newDate = new Date(date);
                      newDate.setHours(hours, minutes, seconds || 0);
                      setEditForm((prev) => ({
                        ...prev,
                        deadline: newDate,
                      }));
                    }
                  }}
                  disabled={loading}
                />
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
            <Button
              className={`cursor-pointer border rounded-2xl text-[12px] sm:text-[14px] px-6 sm:px-8 py-4 ${
                colorScheme === "dark"
                  ? "bg-slate-900 border-slate-700 hover:bg-slate-800"
                  : "bg-slate-200 border-slate-300 hover:bg-slate-300"
              }`}
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="gradient-button"
              onClick={handleSave}
              disabled={loading}
            >
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
