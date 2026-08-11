// Title: Skyline
// Author: Qodec, Ben & TrevorTao
// Video: https://www.youtube.com/watch?v=371wJkGtCZA
// Source: https://app.crackingthecryptic.com/sudoku/hDGn826PjG

// Normal sudoku rules (default rows/cols/3x3 boxes; the payload's `regions`
// array is nine ordinary boxes). No given digits. 14 killer cages: digits
// sum to the small clue in the cage's top-left corner and cannot repeat
// within a cage (Cage bakes in both the sum and the no-repeat clause).

// Cage totals and cells, transcribed from the payload's `cages` array.
const cages = [
  [15, 'R1C2', 'R1C1', 'R2C1'],
  [15, 'R1C5', 'R1C6', 'R2C6', 'R2C7'],
  [15, 'R2C5', 'R2C4', 'R3C4', 'R3C5'],
  [22, 'R3C7', 'R3C6', 'R4C6', 'R4C5'],
  [9, 'R2C9', 'R1C9'],
  [26, 'R5C1', 'R5C2', 'R6C2', 'R6C1'],
  [15, 'R8C1', 'R7C1', 'R7C2'],
  [15, 'R8C2', 'R9C2', 'R9C1'],
  [19, 'R7C4', 'R8C4', 'R9C4'],
  [5, 'R8C5', 'R9C5'],
  [10, 'R8C6', 'R9C6'],
  [13, 'R7C8', 'R8C8'],
  [13, 'R9C8', 'R9C9'],
  [26, 'R6C8', 'R6C9', 'R7C9', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
