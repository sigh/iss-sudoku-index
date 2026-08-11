// Title: Colour To The Nines
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=mzbZYn41TuU
// Source: https://app.crackingthecryptic.com/sudoku/HbR228RMb2

// Normal sudoku rules (default 9x9 shape with standard rows/cols/boxes).
// One given. Sixteen killer cages: each cage's digits are distinct and sum
// to the value printed in its top-left cell -- Cage(sum, ...cells) below.
// Fifteen cages sum to 9; one (bottom-left, R9C1/R9C2) sums to 10, which the
// source explicitly calls out as correct, not a typo.
// The title's "colour" wordplay has no drawn colour/shading data in the
// payload, so no colour mechanic is encoded.

const cages = [
  [9, 'R1C2', 'R1C3', 'R2C2'],
  [9, 'R1C5', 'R1C6', 'R1C7'],
  [9, 'R2C3', 'R2C4', 'R2C5'],
  [9, 'R3C5', 'R3C6', 'R3C7'],
  [9, 'R2C8', 'R3C8', 'R4C8'],
  [9, 'R4C9', 'R5C9', 'R6C9'],
  [9, 'R5C6', 'R5C7'],
  [9, 'R4C5', 'R4C6'],
  [9, 'R5C3', 'R5C4'],
  [9, 'R6C4', 'R6C5'],
  [9, 'R6C1', 'R6C2', 'R7C2'],
  [9, 'R7C3', 'R7C4', 'R7C5'],
  [9, 'R9C3', 'R9C4', 'R9C5'],
  [9, 'R8C5', 'R8C6', 'R8C7'],
  [9, 'R7C8', 'R8C8', 'R8C9'],
  [10, 'R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  new Given('R6C7', 9),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
