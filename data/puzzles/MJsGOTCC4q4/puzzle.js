// Title: Knighten
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=MJsGOTCC4q4
// Source: https://app.crackingthecryptic.com/sudoku/8jdTTqGbgR

// Normal sudoku rules (regions are the standard nine 3x3 boxes, matching the
// payload's `regions` array). Knight's move: no two cells a chess knight's
// move apart share a digit (global AntiKnight). Cages: killer cages, digits
// cannot repeat within a cage and must sum to 10.

// Cages transcribed from the payload's `cages` array (0-indexed [row, col]
// pairs converted to 1-indexed RxCy).
const cages = [
  ['R5C7', 'R6C6', 'R6C7'],
  ['R6C8', 'R6C9', 'R7C8'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R1C4', 'R2C4', 'R3C4'],
  ['R9C3', 'R9C4'],
  ['R2C6', 'R3C6'],
  ['R3C1', 'R3C2'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(cells => new Cage(10, ...cells)),
];
