import { Mistake } from "@/types";

export function getWordMistakes(correct: string, typed: string): Mistake[] {
  const correctWords = correct.trim().split(/\s+/);
  const typedWords = typed.trim().split(/\s+/);

  const mistakes: Mistake[] = [];
  const len = typedWords.length;

  for (let i = 0; i < len; i++) {
    const expected = correctWords[i] || "";
    const actual = typedWords[i];
    if (expected !== actual) {
      mistakes.push({ expected, actual, position: i });
    }
  }

  return mistakes;
}

export function getStatusArray(
  original: string,
  typed: string,
  lookahead = 4
): ("correct" | "wrong" | "pending")[] {
  const oChars = original.split("");
  const tChars = typed.split("");

  let oIndex = 0;
  let tIndex = 0;

  const statusArray: ("correct" | "wrong" | "pending")[] = new Array(
    oChars.length
  ).fill("pending");

  while (oIndex < oChars.length) {
    if (tIndex < tChars.length) {
      if (oChars[oIndex] === tChars[tIndex]) {
        statusArray[oIndex] = "correct";
        oIndex++;
        tIndex++;
      } else {
        let found = false;
        for (let la = 1; la <= lookahead; la++) {
          // insertion
          if (
            tIndex + la < tChars.length &&
            tChars[tIndex + la] === oChars[oIndex]
          ) {
            for (let k = 0; k < la && oIndex + k < oChars.length; k++) {
              statusArray[oIndex + k] = "wrong";
            }
            tIndex += la;
            found = true;
            break;
          }
          // deletion
          if (
            oIndex + la < oChars.length &&
            oChars[oIndex + la] === tChars[tIndex]
          ) {
            for (let k = 0; k < la && oIndex + k < oChars.length; k++) {
              statusArray[oIndex + k] = "wrong";
            }
            oIndex += la;
            found = true;
            break;
          }
        }
        if (!found) {
          statusArray[oIndex] = "wrong";
          oIndex++;
          tIndex++;
        }
      }
    } else {
      statusArray[oIndex] = "pending";
      oIndex++;
    }
  }

  return statusArray;
}

export function calculateAccuracyWord(typed: string, correct: string): number {
  const correctWords = correct.trim().split(/\s+/);
  const typedWords = typed.trim().split(/\s+/);

  let correctCount = 0;
  let compared = 0;

  const len = Math.max(correctWords.length, typedWords.length);
  for (let i = 0; i < len; i++) {
    if (typedWords[i]) {
      compared++;
      if (typedWords[i] === correctWords[i]) {
        correctCount++;
      }
    }
  }

  return compared > 0 ? Math.round((correctCount / compared) * 100) : 0;
}

export function calculateAccuracyChar(typed: string, correct: string): number {
  const statusArray = getStatusArray(correct, typed);
  const typedPortion = statusArray.filter((s) => s !== "pending");
  const correctCount = typedPortion.filter((s) => s === "correct").length;

  return typedPortion.length > 0
    ? Math.round((correctCount / typedPortion.length) * 100)
    : 0;
}

export function calculateProgress(typed: string, correct: string): number {
  if (!correct.length) return 0;

  const typedLength = Math.min(typed.length, correct.length);
  return Math.round((typedLength / correct.length) * 100);
}
