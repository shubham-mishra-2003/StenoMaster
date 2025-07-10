import { Assignment, Score } from "@/types";
import React from "react";
import { useTheme } from "@/hooks/ThemeProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";

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
      <DialogContent className="h-4/5 flex flex-col">
        <DialogHeader>
          <DialogTitle>Assignments Completed</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {studentScores.length == 0 ? (
            <p
              className={`font-bold text-center mt-16 ${
                colorScheme == "dark" ? "text-dark-muted" : "text-light-muted"
              }`}
            >
              No Assignments completed yet
            </p>
          ) : (
            studentScores
              .sort(
                (a, b) =>
                  new Date(b.completedAt).getTime() -
                  new Date(a.completedAt).getTime()
              )
              .slice(0, 5)
              .map((score) => (
                <Card
                  className="flex items-center justify-between p-3"
                  key={score.id}
                >
                  <div>
                    <p
                      className={
                        colorScheme == "dark" ? "text-dark" : "text-light"
                      }
                    >
                      {getAssignmentTitle(score.assignmentId)}
                    </p>
                    <p
                      className={
                        colorScheme == "dark"
                          ? "text-dark-muted"
                          : "text-light-muted"
                      }
                    >
                      Completed{" "}
                      {new Date(score.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-4 text-sm">
                      <span
                        className={
                          colorScheme == "dark" ? "text-dark" : "text-light"
                        }
                      >
                        {score.accuracy}%
                      </span>
                      <span
                        className={
                          colorScheme == "dark"
                            ? "text-dark-muted"
                            : "text-light-muted"
                        }
                      >
                        {score.wpm} WPM
                      </span>
                    </div>
                  </div>
                </Card>
              ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentScoreDetails;
