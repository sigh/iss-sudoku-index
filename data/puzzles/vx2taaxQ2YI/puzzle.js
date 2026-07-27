// Title: Equivalence
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=vx2taaxQ2YI
// Source: https://sudokupad.app/w5gfd237vx

// Normal Sudoku rules apply (default row/column/box all-different from Shape).
// Every cage has the same sum: no cage prints a total, so EqualSum enforces one
// common, unknown total across all 23 cages regardless of size or unique flag.
// 22 of the 23 cages are drawn as "unique" -- an all-different set with no
// total -- so those additionally get AllDifferent. One cage (last row below)
// is not marked unique, so repeats are allowed within it.

// Cage cell lists transcribed from the drawn cages, each with its unique flag.
const cages = [
  { unique: true, cells: ['R5C4', 'R6C4'] },
  { unique: true, cells: ['R6C5', 'R6C6'] },
  { unique: true, cells: ['R4C6', 'R5C6'] },
  { unique: true, cells: ['R4C4', 'R4C5'] },
  { unique: true, cells: ['R6C1', 'R6C2'] },
  { unique: true, cells: ['R6C8', 'R6C9'] },
  { unique: true, cells: ['R6C7', 'R7C7'] },
  { unique: true, cells: ['R9C6', 'R9C7'] },
  { unique: true, cells: ['R8C8', 'R9C8'] },
  { unique: true, cells: ['R8C9', 'R9C9'] },
  { unique: true, cells: ['R8C5', 'R8C6'] },
  { unique: true, cells: ['R1C5', 'R2C5'] },
  { unique: true, cells: ['R1C4', 'R2C4'] },
  { unique: true, cells: ['R7C1', 'R8C1'] },
  { unique: true, cells: ['R7C2', 'R8C2'] },
  { unique: true, cells: ['R3C3', 'R3C4'] },
  { unique: true, cells: ['R1C2', 'R1C3'] },
  { unique: true, cells: ['R3C2', 'R4C2'] },
  { unique: true, cells: ['R3C8', 'R4C8'] },
  { unique: true, cells: ['R8C4', 'R9C4', 'R9C5'] },
  { unique: true, cells: ['R2C9', 'R3C9', 'R4C9'] },
  { unique: true, cells: ['R1C1', 'R2C1', 'R2C2'] },
  { unique: false, cells: ['R2C6', 'R2C7', 'R3C6'] },
];

return [
  new Shape('9x9'),
  new EqualSum(...cages.map(c => c.cells)),
  ...cages.filter(c => c.unique).map(c => new AllDifferent(...c.cells)),
];
