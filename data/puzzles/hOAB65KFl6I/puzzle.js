// Title: The $1,000,000 Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=hOAB65KFl6I
// Source: https://cracking-the-cryptic.web.app/sudoku/GMGqFpmqDF

// Normal sudoku rules apply (rows, columns, boxes -- the default Shape('9x9')
// baseline; the payload's own `regions` array is the standard nine 3x3 boxes).
// No given digits.
// Cells a knight's move apart cannot repeat a digit (AntiKnight).
// Eight cages: a printed top-left number is the cage's sum, and no digit
// repeats within a cage. One cage carries no printed total, so it is
// all-different only (Cage reads a 0 sum as "no total" and silently drops
// the sum check -- AllDifferent is used directly for that cage instead).

// Cage cell lists transcribed from the puzzle's drawn cage geometry.
const cages = [
  [25, 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R2C4'],
  [37, 'R3C4', 'R3C5', 'R2C6', 'R1C6', 'R3C6', 'R1C7'],
  [39, 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7', 'R4C8'],
  [35, 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  [35, 'R7C7', 'R8C7', 'R9C7', 'R8C6', 'R9C8', 'R9C9'],
  [24, 'R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C3'],
  [21, 'R9C1', 'R8C1', 'R7C1', 'R7C2', 'R7C3', 'R6C2'],
];
const noTotalCageCells = ['R3C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3', 'R6C3'];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new AllDifferent(...noTotalCageCells),
];
