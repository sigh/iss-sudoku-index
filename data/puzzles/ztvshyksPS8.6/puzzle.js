// Title: Tilted Windmills
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/nnrFQqJD3D
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Identical digits cannot be a knight's move apart -> AntiKnight.

const givens = [
  ['R1C1', 3], ['R1C7', 7], ['R1C9', 4],
  ['R2C2', 4], ['R2C8', 1],
  ['R3C1', 6], ['R3C3', 1], ['R3C7', 2],
  ['R4C4', 2], ['R4C6', 3],
  ['R6C4', 1], ['R6C6', 4],
  ['R7C3', 4], ['R7C7', 3], ['R7C9', 8],
  ['R8C2', 3], ['R8C8', 2],
  ['R9C1', 2], ['R9C3', 5], ['R9C9', 1],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
