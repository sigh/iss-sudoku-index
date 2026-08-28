// Title: A Window into the Ring
// Author: Spelldaddy
// Video: https://www.youtube.com/watch?v=-1KrtsOqaeA
// Source: https://tinyurl.com/yckds8yr

// Normal sudoku rules apply. Nine killer cages (distinct digits, sum to the
// printed total). Digits a chess knight's move apart may not repeat
// (global, all cells).

// Cages: cells and totals from the payload's killercage array.
const cages = [
  new Cage(22, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(25, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(15, 'R2C5', 'R3C5'),
  new Cage(12, 'R4C9', 'R5C9'),
  new Cage(8, 'R5C1', 'R6C1'),
  new Cage(10, 'R6C7', 'R6C8'),
  new Cage(29, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(7, 'R8C6', 'R9C6'),
  new Cage(30, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),

  new Given('R3C7', 9),
  new Given('R7C3', 6),
  new Given('R8C9', 8),

  ...cages,

  new AntiKnight(),
];
