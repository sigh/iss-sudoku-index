// Title: 5/9/23: Hollow Knight
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lc30O50G_rY
// Source: https://tinyurl.com/2p9bs2t7

// Normal sudoku rules apply. Antiknight: cells a chess knight's move apart
// cannot contain the same digit. `AntiKnight` is the global grid-wide check.

return [
  new Shape('9x9'),

  new Given('R1C7', 3),
  new Given('R2C2', 3), new Given('R2C6', 5), new Given('R2C8', 1),
  new Given('R3C1', 7), new Given('R3C3', 1), new Given('R3C4', 2),
  new Given('R3C5', 3), new Given('R3C6', 4), new Given('R3C7', 5),
  new Given('R4C2', 1), new Given('R4C3', 2), new Given('R4C7', 6),
  new Given('R5C3', 3), new Given('R5C7', 7),
  new Given('R6C3', 4), new Given('R6C7', 8), new Given('R6C8', 9),
  new Given('R7C3', 5), new Given('R7C4', 6), new Given('R7C5', 7),
  new Given('R7C6', 8), new Given('R7C7', 9), new Given('R7C9', 3),
  new Given('R8C2', 9), new Given('R8C4', 5), new Given('R8C8', 7),
  new Given('R9C3', 7),

  new AntiKnight(),
];
