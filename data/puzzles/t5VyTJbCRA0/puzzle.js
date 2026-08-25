// Title: Anti-Knight Killer Sudoku #2
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=t5VyTJbCRA0
// Source: https://app.crackingthecryptic.com/webapp/mPpbBGRQgG

// Normal sudoku (default 3x3 boxes, matching the payload's `regions`). Killer
// cages: digits in a cage sum to the printed total and cannot repeat within
// the cage (Cage(sum, ...cells)). Anti-knight: no two cells a knight's move
// apart repeat a digit (AntiKnight). No givens.

// Cage cells transcribed from the payload's `cages` array (0-indexed
// [row, col] pairs there, converted to 1-indexed R#C# ids here).
const CAGES = [
  [16, 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  [33, 'R1C6', 'R2C5', 'R2C6', 'R2C7', 'R3C6'],
  [8, 'R1C8', 'R2C8', 'R2C9'],
  [25, 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4'],
  [17, 'R5C6', 'R6C5', 'R6C6', 'R6C7', 'R7C6'],
  [13, 'R7C7', 'R7C8', 'R8C7'],
  [13, 'R8C1', 'R8C2', 'R9C2'],
  [30, 'R5C2', 'R6C1', 'R6C2', 'R6C3', 'R7C2'],
];

const cages = CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
];
