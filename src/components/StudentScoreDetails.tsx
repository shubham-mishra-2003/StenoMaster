import { Assignment, Score } from "@/types";
import React from "react";
import { useTheme } from "@/hooks/ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { X } from "lucide-react";

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

  const getAssignmentTitle = (assignmentId: string): string => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      return assignment.title;
    }
    const score = studentScores.find((s) => s.assignmentId === assignmentId);
    return score ? score.assignmentId : assignmentId;
  };

  const handleClose = () => {
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[90%] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assignments Completed</DialogTitle>
        </DialogHeader>
        <div className="flex h-full overflow-auto">
          {studentScores.length === 0 ? (
            <p
              className={`font-bold text-center w-full mt-16 ${
                colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
              }`}
            >
              No Assignments completed yet
            </p>
          ) : (
            <Accordion type="single" collapsible className="size-full">
              {studentScores
                .sort(
                  (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime()
                )
                .map((score, index) => (
                  <AccordionItem
                    className="flex flex-col"
                    value={score.id}
                    key={index}
                  >
                    <AccordionTrigger className="flex items-center">
                      <div
                        className={`flex gap-2 items-center capitalize font-bold ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        {index + 1}.
                        <div className="flex flex-col justify-center">
                          {getAssignmentTitle(score.assignmentId)}
                          <div className="flex gap-2 items-center text-[12px]">
                            <p>
                              Completed at -{" "}
                              {new Date(score.completedAt).toLocaleDateString()}
                            </p>
                            |<p>Accuracy - {score.accuracy}%</p>|
                            <p>WPM - {score.wpm} WPM</p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-1">
                      <h1
                        className={`font-bold text-[16px] text-center ${
                          colorScheme === "dark" ? "text-dark" : "text-light"
                        }`}
                      >
                        Typed Text
                      </h1>
                      <div
                        className={`flex h-[250px] overflow-auto font-bold ${
                          colorScheme === "dark"
                            ? "text-dark-muted"
                            : "text-light-muted"
                        }`}
                      >
                        {score.typedText}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </div>
        <DialogClose
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default StudentScoreDetails;
