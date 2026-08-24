// Title: The Hive
// Author: shye
// Video: https://www.youtube.com/watch?v=a81c9BD5D9o
// Source: https://app.crackingthecryptic.com/sudoku/TRNPFhN9Mn

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). No given digits.
//
// Cages: digits do not repeat in a cage and sum to the clue total (Cage).
// Both main diagonals (drawn in blue) must also contain all of the digits
// 1 to 9 (Diagonal, which enforces all-different across a 9-cell diagonal
// in a 1-9 grid).

// Cages, from the payload's `cages` array (each with a printed sum; digits
// cannot repeat per the rules text).
const cages = [
  [17, 'R1C2', 'R1C3', 'R2C3'],
  [14, 'R2C1', 'R3C1', 'R3C2'],
  [20, 'R1C4', 'R1C5', 'R1C6'],
  [14, 'R3C4', 'R3C5', 'R4C5'],
  [20, 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  [17, 'R4C3', 'R5C3', 'R5C4'],
  [13, 'R5C6', 'R5C7', 'R6C7'],
  [18, 'R6C5', 'R7C5', 'R7C6'],
  [15, 'R7C8', 'R7C9', 'R8C9'],
  [15, 'R8C7', 'R9C7', 'R9C8'],
  [12, 'R4C9', 'R5C9', 'R6C9'],
  [19, 'R4C1', 'R5C1', 'R6C1'],
  [12, 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
  [21, 'R9C4', 'R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  // Anti-diagonal '/' (R1C9..R9C1) and main diagonal '\' (R1C1..R9C9),
  // both drawn in blue -- distinct directions, so no constraint collapse.
  new Diagonal(1),
  new Diagonal(-1),
];
