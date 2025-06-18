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
import {
  BookOpen,
  Users,
  BarChart3,
  Plus,
  Zap,
  Target,
  Timer,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Class } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/ThemeProvider";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  onActionSelect: (tab: string) => void;
}

const QuickActionModal = ({
  isOpen,
  onClose,
  action,
  onActionSelect,
}: QuickActionModalProps) => {
  const [classes, setClasses] = useLocalStorage<Class[]>(
    "stenolearn-classes",
    []
  );
  const [newClassName, setNewClassName] = useState("");
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  const handleAction = (tab: string) => {
    onActionSelect(tab);
    onClose();
  };

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

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    setIsCreatingClass(false);

    toast({
      title: "Success",
      description: `Class "${newClassName}" created successfully!`,
    });

    handleAction("classes");
  };

  const startSpeedTest = () => {
    toast({
      title: "Speed Test Started",
      description: "Get ready for your typing test!",
    });
    handleAction("typing-test");
  };

  const getModalContent = () => {
    switch (action) {
      case "assignments":
        return {
          title: "Assignment Actions",
          actions: [
            {
              label: "View All Assignments",
              tab: "assignments",
              icon: BookOpen,
              description: "Browse and manage assignments",
            },
            {
              label: "Practice Mode",
              tab: "practice",
              icon: Target,
              description: "Start practicing stenography",
            },
          ],
        };
      case "classes":
        return {
          title: "Class Management",
          actions: [
            {
              label: "View All Classes",
              tab: "classes",
              icon: Users,
              description: "Manage your classes and students",
            },
            {
              label: "Quick Create Class",
              tab: "quick-create",
              icon: Plus,
              description: "Create a new class instantly",
              isQuickAction: true,
            },
          ],
        };
      case "scores":
        return {
          title: "Student Progress",
          actions: [
            {
              label: "View All Scores",
              tab: "scores",
              icon: BarChart3,
              description: "Analyze student performance",
            },
            {
              label: "Student Progress",
              tab: "progress",
              icon: Target,
              description: "Track learning progress",
            },
          ],
        };
      case "speed-test":
        return {
          title: "Typing Test",
          actions: [
            {
              label: "Start Speed Test",
              tab: "quick-test",
              icon: Zap,
              description: "Begin immediate typing test",
              isQuickAction: true,
            },
            {
              label: "View Test History",
              tab: "progress",
              icon: Timer,
              description: "See your past test results",
            },
          ],
        };
      default:
        return {
          title: "Quick Actions",
          actions: [],
        };
    }
  };

  const { title, actions } = getModalContent();
  const { colorScheme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        {isCreatingClass ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="class-name"
                className={`text-sm font-medium ${
                  colorScheme == "dark" ? "text-dark" : "text-light"
                }`}
              >
                Class Name
              </Label>
              <Input
                id="class-name"
                placeholder="Enter class name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className={`focus:ring-2 focus:ring-blue-500 ${
                  colorScheme == "dark"
                    ? "border-gray-700 bg-gray-800/60"
                    : "bg-white/60 border-gray-200"
                }`}
                onKeyPress={(e) => e.key === "Enter" && handleCreateClass()}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreatingClass(false)}
                className={`flex-1 ${
                  colorScheme == "dark"
                    ? "border-gray-600 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClass}
                className="flex-1 gradient-button"
              >
                Create Class
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {actions.map((actionItem, index) => {
              const Icon = actionItem.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full cursor-pointer justify-start h-auto p-4 hover:bg-gradient-to-r transition-all duration-300 hover:shadow-md rounded-lg border border-transparent ${
                    colorScheme == "dark"
                      ? "hover:from-blue-950/50 hover:via-purple-950/50 hover:to-indigo-950/50  hover:border-blue-800/50"
                      : "hover:from-blue-50/80 hover:via-purple-50/80 hover:to-indigo-50/80 hover:border-blue-200/50"
                  }`}
                  onClick={() => {
                    if (actionItem.tab === "quick-create") {
                      setIsCreatingClass(true);
                    } else if (actionItem.tab === "quick-test") {
                      startSpeedTest();
                    } else {
                      handleAction(actionItem.tab);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3 text-left">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          colorScheme == "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {actionItem.label}
                      </div>
                      {actionItem.description && (
                        <div
                          className={`text-sm mt-1 ${
                            colorScheme == "dark" ? "text-dark" : "text-light"
                          }`}
                        >
                          {actionItem.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickActionModal;
