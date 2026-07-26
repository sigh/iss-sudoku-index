// Title: X, Y and Z???
// Author: Fenners
// Video: https://www.youtube.com/watch?v=NA-YNZTXRzU
// Source: https://sudokupad.app/nk5f0ylrde

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions array is just the default 3x3 boxes).
//
// Killer cages: each cage is distinct-digit (AllDifferent), and cages
// sharing a letter (X/Y/Z) sum to the same, solver-determined total
// (EqualSum across same-letter cages). No cage prints a numeric total.
//
// Kropki white dots: consecutive digits (WhiteDot).
//
// Renban lines: non-repeating consecutive digits in any order (Renban).

const xCages = [
  ['R7C2', 'R8C2'],
  ['R7C5', 'R8C5'],
  ['R7C8', 'R8C8'],
];

const yCages = [
  ['R1C8', 'R2C8', 'R3C8'],
  ['R1C5', 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  ['R1C2', 'R2C2', 'R3C2', 'R3C3'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8'],
];

const zCages = [
  ['R5C5', 'R6C5'],
  ['R1C4', 'R2C4'],
  ['R6C1', 'R6C2'],
  ['R4C9', 'R5C9'],
];

const allCages = [...xCages, ...yCages, ...zCages];

const renbanLines = [
  ['R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C8', 'R5C7', 'R6C7'],
  ['R6C4', 'R5C4', 'R4C5', 'R5C6', 'R6C6', 'R7C5', 'R8C5'],
  ['R8C2', 'R7C2', 'R6C3', 'R5C3', 'R4C2', 'R5C1', 'R6C1'],
  ['R1C1', 'R2C1'],
  ['R3C6', 'R3C7'],
];

const whiteDots = [
  ['R8C2', 'R9C2'],
  ['R8C5', 'R9C5'],
  ['R8C8', 'R9C8'],
];

return [
  new Shape('9x9'),

  new Given('R8C2', 1),
  new Given('R8C5', 2),
  new Given('R8C8', 3),

  // Distinctness within each killer cage (no printed total).
  ...allCages.map(cells => new AllDifferent(...cells)),

  // Same-letter cages sum to the same (solver-determined) value.
  new EqualSum(...xCages),
  new EqualSum(...yCages),
  new EqualSum(...zCages),

  ...whiteDots.map(cells => new WhiteDot(...cells)),

  ...renbanLines.map(cells => new Renban(...cells)),
];
