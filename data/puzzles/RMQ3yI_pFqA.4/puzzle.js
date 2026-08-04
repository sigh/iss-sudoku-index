// Title: The Ides of March
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=RMQ3yI_pFqA
// Source: https://tinyurl.com/362thees

// Normal sudoku rules apply, plus Anti-King: cells a king's move apart
// cannot share a digit. AntiKing is a global no-argument constraint.

return [
  new Shape('9x9'),

  new Given('R2C2', 4),
  new Given('R2C4', 8),
  new Given('R2C6', 7),
  new Given('R2C8', 1),
  new Given('R3C5', 3),
  new Given('R3C6', 2),
  new Given('R4C2', 6),
  new Given('R4C3', 1),
  new Given('R4C8', 5),
  new Given('R5C3', 2),
  new Given('R5C7', 4),
  new Given('R6C2', 7),
  new Given('R6C7', 3),
  new Given('R6C8', 8),
  new Given('R7C4', 4),
  new Given('R7C5', 1),
  new Given('R8C2', 3),
  new Given('R8C4', 5),
  new Given('R8C6', 6),
  new Given('R8C8', 2),

  new AntiKing(),
];
