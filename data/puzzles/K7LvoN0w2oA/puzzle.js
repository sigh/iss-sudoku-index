// Title: A Puzzle Palindrome
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=K7LvoN0w2oA
// Source: https://cracking-the-cryptic.web.app/sudoku/p8b67RB9J9

// The source publishes no rules text, so each drawn feature is read by its
// standard SudokuPad drawing convention.
//
// Encoded:
//   - Normal sudoku: each row, column and 3x3 box contains 1-9 once. The
//     payload's regions are exactly the nine ordinary boxes, and there are no
//     given digits.
//   - Killer cages: sixteen dashed cages with a printed total; the digits in
//     a cage sum to that total and do not repeat.
//
// Not encoded:
//   - The six solid black dots drawn on cell edges (R3C4|R3C5, R2C1|R3C1,
//     R4C3|R4C4, R4C9|R5C9, R7C4|R8C4, R9C3|R9C4). Every standard meaning for
//     an edge mark of this shape contradicts the cage totals, so what the dots
//     require is not recoverable. The cleanest case is R2C1|R3C1: column 1's
//     lower six cells are caged at 23, so R1C1+R2C1+R3C1 = 22; box 1 is
//     covered by the 25-cage, the 12-cage and R3C3, so R3C3 = 8; three
//     distinct digits of box 1 summing to 22 without using 8 can only be
//     {6,7,9}. No two of 6, 7, 9 are in a 2:1 ratio, none sum to 5 or 10, and
//     R3C1 is 7 or 9 (R3C1 + R3C2 = 12 with both in row 3 and neither 8),
//     which leaves 6|7 as the only consecutive option -- and that one is
//     excluded by the remaining cages.
//   - The fifteen light-grey (#CFCFCF) shaded cells. They are exactly the
//     fifteen cells no cage covers and together they draw the numeral "2" for
//     the puzzle's 02-02-2020 publication date, so they are read as artwork;
//     no rules text gives them any other meaning.
//
// Without those, this encoding is much weaker than the puzzle: it is a killer
// sudoku with no givens and does not resolve to a single grid.

// Cage totals and cells, transcribed from the sixteen drawn cages
// (payload order; coordinates converted from the payload's 0-indexed
// [row, col] pairs to R#C# numbering).
const cages = [
  [25, 'R1C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R2C3'],
  [12, 'R3C1', 'R3C2'],
  [22, 'R1C4', 'R1C5', 'R1C6'],
  [21, 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  [24, 'R2C7', 'R2C8', 'R3C8', 'R3C9', 'R4C9'],
  [23, 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  [20, 'R4C2', 'R5C2', 'R6C2', 'R5C3'],
  [22, 'R6C3', 'R7C3', 'R7C2'],
  [22, 'R8C2', 'R9C2', 'R9C3'],
  [12, 'R9C4', 'R9C5', 'R9C6'],
  [20, 'R9C7', 'R9C8', 'R9C9', 'R8C9'],
  [22, 'R8C8', 'R7C8', 'R7C9'],
  [20, 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R5C9'],
  [22, 'R5C7', 'R6C7', 'R6C6', 'R7C6', 'R7C7', 'R7C5'],
  [12, 'R3C4', 'R3C5', 'R3C6'],
  [21, 'R4C4', 'R5C4', 'R6C4', 'R5C5', 'R4C5', 'R4C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
