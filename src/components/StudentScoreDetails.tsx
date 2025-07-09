import { Assignment, Score } from "@/types";
import React, { JSX } from "react";
import { Card, CardContent } from "./ui/card";
import { useTheme } from "@/hooks/ThemeProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

type StudentScoreDetailsProps = {
  studentScores: Score[];
  assignments: Assignment[];
  isOpen: boolean;
  onClose: () => void;
};

const StudentScoreDetails = ({
  studentScores,
  assignments,
  isOpen,
  onClose,
}: StudentScoreDetailsProps) => {
  const { colorScheme } = useTheme();

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || "Unknown Assignment";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {studentScores.length === 0
              ? "No assignments completed yet"
              : "Recent Assignments"}
          </DialogTitle>
        </DialogHeader>
        {studentScores.length !== 0 && (
          <div className="space-y-2">
            {studentScores
              .sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )
              .slice(0, 5)
              .map((score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/50 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                >
                  <div>
                    <p className="font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                      {getAssignmentTitle(score.assignmentId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed{" "}
                      {new Date(score.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-4 text-sm">
                      <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-blue-200 dark:to-gray-100 bg-clip-text text-transparent">
                        {score.accuracy}%
                      </span>
                      <span className="text-muted-foreground">
                        {score.wpm} WPM
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentScoreDetails;
