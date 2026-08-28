// Title: Dec 19, 2021: Thermo Killer
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=4cJENB2S1pI
// Source: https://tinyurl.com/2s34msa9

// Normal sudoku rules apply. Digits in a cage cannot repeat and must sum to
// the indicated total. Digits along a thermometer must strictly increase,
// starting from the bulb. Rows, columns, and boxes are ISS's default; no
// other geometry is drawn.

// Killer cages: cells and totals from the payload's killercage array.
const cages = [
  [8, 'R1C1', 'R1C2', 'R1C3'],
  [24, 'R1C5', 'R1C6', 'R1C7'],
  [9, 'R1C9', 'R2C9', 'R3C9'],
  [20, 'R3C1', 'R4C1', 'R5C1'],
  [11, 'R3C6', 'R3C7', 'R4C7'],
  [20, 'R5C9', 'R6C9', 'R7C9'],
  [8, 'R6C3', 'R7C3', 'R7C4'],
  [11, 'R7C1', 'R8C1', 'R9C1'],
  [21, 'R9C3', 'R9C4', 'R9C5'],
  [8, 'R9C7', 'R9C8', 'R9C9'],
  // The 9-cell "plus" around the centre; total 45 = 1+...+9 is still a real
  // no-repeat + sum constraint (it forces each digit 1-9 exactly once here).
  [45, 'R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
];

// Thermometers: cells from the payload's thermometer array, bulb first
// (f-puzzles/SudokuPad convention: thermometer cell order is bulb-first).
const thermos = [
  ['R5C5', 'R4C5', 'R3C5'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R5C5', 'R6C5', 'R7C5'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R5C1', 'R4C1', 'R3C1'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R7C6', 'R7C7', 'R6C7'],
  ['R3C4', 'R3C3', 'R4C3'],
];

return [
  new Shape('9x9'),

  new Given('R4C4', 5),
  new Given('R4C6', 7),
  new Given('R6C4', 8),
  new Given('R6C6', 9),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
];
