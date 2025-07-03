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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popver";
import { Calendar } from "@/components/ui/calendar";
import { Assignment, Class } from "@/types";
import { Upload, Save, X, ChevronDownIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";
import { useAssignment } from "@/hooks/useAssignments";

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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: assignment?.title || "",
    deadline: assignment?.deadline ? new Date(assignment.deadline) : new Date(),
    correctText: assignment?.correctText || "",
    classId: assignment?.classId || "",
    imageFile: null as File | null,
    imageUrl: assignment?.imageUrl || "",
  });

  useEffect(() => {
    if (assignment) {
      setEditForm({
        title: assignment.title,
        deadline: new Date(assignment.deadline),
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
        imageUrl: URL.createObjectURL(file), // Local preview
      }));
    }
  };

  const handleSave = async () => {
    if (
      !assignment ||
      !editForm.title.trim() ||
      !editForm.correctText.trim() ||
      !editForm.classId
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAssignment(assignment.id, {
        title: editForm.title,
        deadline: editForm.deadline,
        correctText: editForm.correctText,
        classId: editForm.classId,
        imageFile: editForm.imageFile,
        imageUrl: editForm.imageUrl,
      });
      onSave({
        ...assignment,
        title: editForm.title,
        deadline: editForm.deadline,
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
                <Label htmlFor="deadline-date">Set a deadline time</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="deadline-date"
                      className={`w-full h-12 justify-between font-normal rounded-xl border-2 ${
                        colorScheme === "dark"
                          ? "border-slate-500 shadow-slate-950"
                          : "border-slate-400 shadow-slate-400"
                      }`}
                      disabled={loading}
                    >
                      {editForm.deadline
                        ? editForm.deadline.toLocaleDateString()
                        : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-full overflow-hidden p-0 bg-gradient-to-tr ${
                      colorScheme === "dark"
                        ? "from-gray-900 via-gray-800/90 to-gray-700/70 border-slate-700"
                        : "from-white via-blue-100/100 to-white/90 border-slate-400"
                    }`}
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={editForm.deadline}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setEditForm((prev) => ({
                          ...prev,
                          deadline: date || new Date(),
                        }));
                        setDatePickerOpen(false);
                      }}
                      disabled={loading}
                    />
                  </PopoverContent>
                </Popover>
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
