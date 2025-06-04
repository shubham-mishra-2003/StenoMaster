
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assignment, Class } from "@/types";
import { Upload, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  classes
}: EditAssignmentModalProps) => {
  const [editForm, setEditForm] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    correctText: assignment?.correctText || "",
    classId: assignment?.classId || "",
    imageFile: null as File | null,
    imageUrl: assignment?.imageUrl || ""
  });

  React.useEffect(() => {
    if (assignment) {
      setEditForm({
        title: assignment.title,
        description: assignment.description,
        correctText: assignment.correctText,
        classId: assignment.classId,
        imageFile: null,
        imageUrl: assignment.imageUrl
      });
    }
  }, [assignment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({ 
          ...prev, 
          imageFile: file,
          imageUrl: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!assignment || !editForm.title.trim() || !editForm.correctText.trim() || !editForm.classId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const updatedAssignment: Assignment = {
      ...assignment,
      title: editForm.title,
      description: editForm.description,
      correctText: editForm.correctText,
      classId: editForm.classId,
      imageUrl: editForm.imageUrl || assignment.imageUrl
    };

    onSave(updatedAssignment);
    onClose();
    
    toast({
      title: "Success",
      description: "Assignment updated successfully.",
    });
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Assignment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
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
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-class">Select Class</Label>
                <Select value={editForm.classId} onValueChange={(value) => setEditForm(prev => ({ ...prev, classId: value }))}>
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
                <Label htmlFor="edit-image-upload">Update Image/PDF</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
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
                          Click to upload new image or PDF
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
              onChange={(e) => setEditForm(prev => ({ ...prev, correctText: e.target.value }))}
              rows={6}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {editForm.correctText.length} characters
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
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
