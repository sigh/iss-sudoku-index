// Title: House of X
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=6YB2c_8I0fU
// Source: https://app.crackingthecryptic.com/sudoku/qhRdqQDTq9

// Normal sudoku rules apply (default rows/columns/boxes on the 9x9 grid).
// Digits cannot repeat along marked diagonals: two same-coloured diagonal
// lines are drawn, corner to corner, crossing at R5C5 to form the "X" the
// title names -- the main diagonal (R1C1..R9C9) and the anti-diagonal
// (R1C9..R9C1). Diagonal(-1) is ISS's '\' (main) direction and Diagonal(1)
// is its '/' (anti) direction.
return [
  new Shape('9x9'),
  new Given('R1C2', 1),
  new Given('R1C6', 2),
  new Given('R1C8', 3),
  new Given('R2C1', 4),
  new Given('R2C3', 5),
  new Given('R2C7', 6),
  new Given('R3C2', 6),
  new Given('R3C4', 5),
  new Given('R4C3', 2),
  new Given('R4C5', 1),
  new Given('R5C4', 3),
  new Given('R5C6', 7),
  new Given('R6C5', 8),
  new Given('R6C7', 7),
  new Given('R7C6', 3),
  new Given('R7C8', 6),
  new Given('R8C3', 6),
  new Given('R8C7', 4),
  new Given('R8C9', 5),
  new Given('R9C2', 7),
  new Given('R9C4', 9),
  new Given('R9C8', 8),
  new Diagonal(-1),
  new Diagonal(1),
];
