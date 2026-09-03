// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=M7CZmrarl5U
// Source: https://cracking-the-cryptic.web.app/sudoku/JbhhGf7nf2

// Normal Sudoku rules apply.
//
// X-Sums: a clue outside the grid gives the sum of the first X digits in that
// row or column, counting from the clue, where X is the digit in the cell
// nearest the clue.
//
// Liar: every clue, both the ones outside the grid and the small digits drawn
// inside cells, is incorrect by exactly 1. So an outside clue printed 20 marks
// a true X-sum of 19 or 21, and a small digit printed d marks a true cell digit
// of d-1 or d+1.
//
// The source payload carries no rules text; the ruleset is taken from the video
// description, which links this exact source URL and states the X-Sums rule and
// the "all clues inside and outside the grid are incorrect by 1" twist. The
// video title is "Liar X-Sums".

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// A printed value is off by exactly 1, so the truth is one of its two
// neighbours, keeping only those the quantity can actually take.
const liarValues = (printed, lo, hi) =>
  [printed - 1, printed + 1].filter(v => v >= lo && v <= hi);

// Outside clues, transcribed from the ten text marks drawn in the margin ring:
// the cell nearest the clue, and the step direction the clue looks along.
const outsideClues = [
  ['R1C1', 1, 0],   // above column 1
  ['R1C8', 1, 0],   // above column 8
  ['R1C9', 1, 0],   // above column 9
  ['R9C4', -1, 0],  // below column 4
  ['R9C7', -1, 0],  // below column 7
  ['R9C9', -1, 0],  // below column 9
  ['R1C1', 0, 1],   // left of row 1
  ['R9C1', 0, 1],   // left of row 9
  ['R5C9', 0, -1],  // right of row 5
  ['R7C9', 0, -1],  // right of row 7
];
// Every outside mark is printed "20". An X-sum runs from 1 to 45 on a 9x9.
const xSumValues = liarValues(20, 1, 45);

// Inside clues, transcribed from the six small text marks drawn in the
// top-right corner of a cell: [cell, printed digit].
const insideClues = [
  ['R2C5', 2],
  ['R6C4', 2],
  ['R7C5', 0],
  ['R3C6', 0],
  ['R3C8', 5],
  ['R6C2', 4],
];

return [
  new Shape('9x9'),

  ...outsideClues.map(([entry, dRow, dCol]) => new Or(
    xSumValues.map(
      v => XSum.fromCells(v, graph.ray(entry, dRow, dCol), geometry)))),

  ...insideClues.map(
    ([cell, printed]) => new Given(cell, ...liarValues(printed, 1, 9))),
];
