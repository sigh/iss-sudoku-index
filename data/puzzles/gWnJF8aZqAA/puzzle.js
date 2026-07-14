// Title: The Witching Hour
// Author: Chefofdeath
// Video: https://www.youtube.com/watch?v=gWnJF8aZqAA
// Source: https://sudokupad.app/nd0191ecm9

// Normal sudoku rules (default 3x3 boxes). No given digits.
//
// White dot: digits separated by a white dot have a difference of 3 (not the
// usual Kropki "consecutive" reading -- encoded with a custom Pair per edge).
//
// Renban: digits along a line form a set of non-repeating consecutive digits
// in any order.
//
// X-Sums: a clue outside the grid gives the sum of the first X digits of the
// row/column, counted from the clue's side, where X is the digit nearest the
// clue.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Difference-of-3 dot: not a standard WhiteDot (which is difference-of-1).
const diff3 = Pair.fnToKey((a, b) => Math.abs(a - b) === 3, 9);

return [
  new Shape('9x9'),

  // Renban lines.
  new Renban('R2C1', 'R3C1', 'R4C1'),
  new Renban('R1C4', 'R1C3', 'R1C2'),
  new Renban('R4C7', 'R5C7', 'R6C7'),
  new Renban('R7C6', 'R7C5', 'R7C4'),
  new Renban('R3C6', 'R3C5', 'R3C4'),
  new Renban('R3C8', 'R4C9', 'R5C9'),
  new Renban('R8C3', 'R9C4', 'R9C5'),
  new Renban('R7C2', 'R6C3', 'R5C3', 'R4C3'),
  new Renban('R5C6', 'R5C5', 'R6C5'),

  // White dots: difference of 3.
  new Pair(diff3, 'difference of 3', 'R1C5', 'R1C6'),
  new Pair(diff3, 'difference of 3', 'R1C8', 'R1C9'),
  new Pair(diff3, 'difference of 3', 'R5C1', 'R6C1'),
  new Pair(diff3, 'difference of 3', 'R8C1', 'R9C1'),
  new Pair(diff3, 'difference of 3', 'R4C6', 'R5C6'),
  new Pair(diff3, 'difference of 3', 'R6C4', 'R6C5'),
  new Pair(diff3, 'difference of 3', 'R5C4', 'R5C5'),

  // X-Sums (outside clues).
  XSum.fromCells(20, graph.column(7), geometry), // clue at top of C7
  XSum.fromCells(21, graph.row(7), geometry), // clue at left of R7
];
