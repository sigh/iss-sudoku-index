// Title: Some Puzzles Can Soothe Your Soul
// Author: Jannick Thanner
// Video: https://www.youtube.com/watch?v=JqJOWk4GmT0
// Source: https://cracking-the-cryptic.web.app/sudoku/23DHpDj398

// Normal sudoku rules apply. Seven killer cages (8 cells each, distinct
// digits, sum to the printed total 44). Digits a chess knight's move apart
// may not repeat (global, all cells).

// Cages: cells and totals from the payload's cages array.
const cages = [
  new Cage(44, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3'),
  new Cage(44, 'R5C2', 'R6C2', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C2'),
  new Cage(44, 'R1C4', 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R3C5', 'R3C6'),
  new Cage(44, 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C8', 'R2C9', 'R3C7', 'R3C8'),
  new Cage(44, 'R4C8', 'R4C9', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C7'),
  new Cage(44, 'R5C4', 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R8C4', 'R9C3', 'R9C4'),
  new Cage(44, 'R7C6', 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),

  new Given('R1C9', 8),
  new Given('R3C3', 7),
  new Given('R4C7', 2),
  new Given('R6C6', 9),
  new Given('R8C9', 5),
  new Given('R9C5', 3),
  new Given('R9C6', 6),

  ...cages,

  new AntiKnight(),
];
