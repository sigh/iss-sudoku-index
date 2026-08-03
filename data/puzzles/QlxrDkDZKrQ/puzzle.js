// Title: Dislocation
// Author: Ali M
// Video: https://www.youtube.com/watch?v=QlxrDkDZKrQ
// Source: https://app.crackingthecryptic.com/sudoku/gmhm44MnFg

// Normal sudoku rules apply (standard 3x3 boxes; no non-standard regions are
// drawn). Cells a chess knight's move apart cannot hold the same digit
// (AntiKnight). Cages are killer cages: digits inside a cage do not repeat
// and must sum to the shown total (Cage).

// Cage cell lists are transcribed from the payload's `cages` array (10 real
// entries; the rest are metadata stubs for title/author/rules/solution).
const cages = [
  new Cage(20, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(7, 'R1C7', 'R1C8'),
  new Cage(45, 'R3C3', 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5'),
  new Cage(16, 'R3C7', 'R3C8'),
  new Cage(10, 'R4C8', 'R5C8'),
  new Cage(11, 'R5C6', 'R6C5', 'R6C6'),
  new Cage(4, 'R6C8', 'R6C9'),
  new Cage(7, 'R7C1', 'R8C1'),
  new Cage(17, 'R7C3', 'R8C3'),
  new Cage(3, 'R8C6', 'R9C6'),
];

return [
  new Shape('9x9'),
  new Given('R4C6', 3),
  new AntiKnight(),
  ...cages,
];
