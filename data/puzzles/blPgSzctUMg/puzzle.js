// Title: How to slice a sandwich
// Author: Ul-Rhymm
// Video: https://www.youtube.com/watch?v=blPgSzctUMg
// Source: https://sudokupad.app/9fjvy1dcyo

// Normal sudoku rules apply. RENBAN (pink lines): each line's digits form a
// set of consecutive, non-repeating values, in any order. SANDWICH: a number
// outside the grid gives the sum of the digits strictly between the 1 and the
// 9 in that row or column. Only six rows/columns carry a sandwich clue.
//
// ENCODED HERE (validated against the known solution): normal sudoku, all
// nine renban lines, and all six sandwich clues. Nothing is omitted.

const renbanLines = [
  ['R6C8', 'R7C8', 'R8C9', 'R9C8', 'R8C7', 'R8C6'],
  ['R2C6', 'R2C7', 'R1C8', 'R2C9', 'R3C8', 'R4C8'],
  ['R4C2', 'R3C2', 'R2C1', 'R1C2', 'R2C3', 'R2C4'],
  ['R6C2', 'R7C2', 'R8C1', 'R9C2', 'R8C3', 'R8C4'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R3C4', 'R4C3'],
  ['R8C5', 'R9C6'],
  ['R3C9', 'R4C9'],
];

const sandwichClues = [
  ['R2,1', 16],
  ['R5,1', 20],
  ['R8,1', 16],
  ['C2,1', 17],
  ['C5,1', 20],
  ['C8,1', 17],
];

const constraints = [new Shape('9x9')];
for (const cells of renbanLines) constraints.push(new Renban(...cells));
for (const [arrowId, value] of sandwichClues) {
  constraints.push(new Sandwich(arrowId, value));
}

return constraints;
