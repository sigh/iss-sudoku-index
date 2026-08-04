// Title: 3/6/23: Happy Anniversary
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=MhlzTkWXXEM
// Source: https://tinyurl.com/2rjssw9k

// Normal sudoku rules apply.
// Diagonal: Digits along the indicated diagonals cannot repeat.
// Payload sets both diagonal+ and diagonal-, so both diagonals are marked.
return [
  new Shape('9x9'),

  new Given('R1C2', 1), new Given('R1C6', 6), new Given('R1C8', 4),
  new Given('R2C1', 8), new Given('R2C3', 2), new Given('R2C7', 1),
  new Given('R3C2', 7), new Given('R3C4', 3),
  new Given('R4C3', 6), new Given('R4C5', 2),
  new Given('R5C4', 5), new Given('R5C6', 1),
  new Given('R6C5', 6), new Given('R6C7', 2),
  new Given('R7C6', 7), new Given('R7C8', 3),
  new Given('R8C3', 5), new Given('R8C7', 6), new Given('R8C9', 4),
  new Given('R9C2', 3), new Given('R9C4', 2), new Given('R9C8', 5),

  // diagonal+ ('/'): anti-diagonal, R9C1..R1C9.
  new Diagonal(1),
  // diagonal- ('\'): main diagonal, R1C1..R9C9.
  new Diagonal(-1),
];
