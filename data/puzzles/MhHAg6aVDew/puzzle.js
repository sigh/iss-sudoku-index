// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=MhHAg6aVDew
// Source: https://sudokupad.app/6203l9v3a2

// Normal sudoku rules apply (default 9x9 rows/columns/boxes). Digits in each
// cage may not repeat and must sum to the cage's printed total: one Cage per
// clue. Cage cells and totals below are transcribed from the puzzle's drawn
// cage outlines and their printed totals.

const cages = [
  [24, 'R1C1', 'R2C1', 'R2C2'],
  [20, 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  [16, 'R1C6', 'R1C7', 'R1C8'],
  [19, 'R1C9', 'R2C9', 'R2C8', 'R3C8'],
  [9, 'R2C3', 'R2C4', 'R3C4'],
  [7, 'R2C5', 'R2C6'],
  [27, 'R2C7', 'R3C7', 'R3C6', 'R4C7'],
  [8, 'R3C1', 'R4C1', 'R5C1'],
  [20, 'R3C2', 'R3C3', 'R4C2', 'R5C2'],
  [19, 'R3C5', 'R4C5', 'R5C5', 'R6C5'],
  [8, 'R3C9', 'R4C9', 'R4C8'],
  [23, 'R4C3', 'R4C4', 'R5C4', 'R5C3'],
  [20, 'R4C6', 'R5C6', 'R5C7', 'R5C8'],
  [18, 'R5C9', 'R6C9', 'R7C9'],
  [24, 'R6C1', 'R7C1', 'R8C1', 'R8C2'],
  [9, 'R6C2', 'R7C2'],
  [16, 'R6C3', 'R7C3'],
  [11, 'R6C4', 'R7C4', 'R7C5'],
  [10, 'R6C6', 'R7C6'],
  [16, 'R6C7', 'R6C8', 'R7C8', 'R7C7'],
  [19, 'R8C3', 'R8C4', 'R8C5', 'R9C5'],
  [4, 'R9C1', 'R9C2'],
  [15, 'R9C3', 'R9C4'],
  [14, 'R8C6', 'R8C7', 'R8C8'],
  [12, 'R9C6', 'R9C7', 'R9C8'],
  [17, 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
