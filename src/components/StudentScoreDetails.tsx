import { Assignment, Score } from "@/types";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useTheme } from "@/hooks/ThemeProvider";
import { sampleTexts } from "@/app/dashboard/student/test/sample-texts";

interface StudentScoreDetailsProps {
  assignments: Assignment[];
  score: Score;
  isOpen: boolean;
  onClose: () => void;
}

const WordDisplay = ({
  expected,
  typed,
  mistake,
}: {
  expected: string;
  typed?: string;
  mistake?: { expected: string };
}) => {
  const { colorScheme } = useTheme();
  if (!typed) {
    return (
      <span
        className={`${
          colorScheme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {expected}
      </span>
    );
  }
  if (mistake) {
    return (
      <div className="relative inline-block">
        <span
          className={`font-semibold italic absolute -top-5 left-0 ${
            colorScheme === "dark" ? "text-green-400" : "text-green-600"
          }`}
        >
          {mistake.expected}
        </span>
        <span
          className={`line-through ${
            colorScheme === "dark" ? "text-red-400" : "text-red-600"
          }`}
        >
          {typed}
        </span>
      </div>
    );
  }
  return (
    <span
      className={colorScheme === "dark" ? "text-green-400" : "text-green-600"}
    >
      {typed}
    </span>
  );
};

const StudentScoreDetails = ({
  assignments,
  score,
  isOpen,
  onClose,
}: StudentScoreDetailsProps) => {
  const { colorScheme } = useTheme();

  const isTypingTest = score.assignmentId.startsWith("typing-test-text-");

  let correctText = "";
  let assignmentTitle = "Unknown Assignment";

  if (isTypingTest) {
    const index = parseInt(
      score.assignmentId.replace("typing-test-text-", ""),
      10
    );
    correctText = sampleTexts[index] || "";
    assignmentTitle = `Typing Test #${index + 1}`;
  } else {
    const assignment = assignments.find((a) => a.id === score.assignmentId);
    correctText = assignment?.correctText || "";
    assignmentTitle = assignment ? assignment.title : "Unknown Assignment";
  }

  const correctWords = correctText.trim().split(/\s+/);
  const typedWords = score.typedText.trim().split(/\s+/);
  const mistakeMap = new Map(score.mistakes.map((m) => [m.position, m]));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[80%] flex flex-col w-full max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-sm sm:text-lg lg:text-xl font-bold gradient-text">
            {assignmentTitle}
          </DialogTitle>
          <div
            className={`flex font-bold gap-2 items-center justify-center text-[12px] sm:text-sm w-full lg:text-base ${
              colorScheme === "dark" ? "text-dark-muted" : "text-light-muted"
            }`}
          >
            <p>
              Completed at - {new Date(score.completedAt).toLocaleDateString()}
            </p>
            |<p>Accuracy - {score.accuracy}%</p>|<p>WPM - {score.wpm} WPM</p>
          </div>
        </DialogHeader>
        <div className="flex gap-2 flex-wrap font-bold h-full overflow-auto italic pt-6">
          {correctWords.map((word, i) => (
            <WordDisplay
              key={i}
              expected={word}
              typed={typedWords[i]}
              mistake={mistakeMap.get(i)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentScoreDetails;
