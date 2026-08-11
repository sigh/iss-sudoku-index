// Title: Some On Some Off
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=NoqQD2TrxWI
// Source: https://app.crackingthecryptic.com/sudoku/DJ2BHjrDQT
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits cannot repeat on either marked diagonal -> Diagonal(-1) for the
// '\' diagonal R1C1-R9C9, Diagonal(1) for the '/' diagonal R1C9-R9C1.
// Digits along an arrow sum to the number in the attached circle, and can
// include repeats -> one Arrow(circle, ...arm) per arrow; Arrow does not
// impose all-different on the arm cells, matching the stated repeats-allowed
// rule.
//
// Arrow cells (circle first, then arm) were read off the drawn geometry:
// each arrow's wayPoints polyline starts inside a circled cell (matched
// against the overlays entry at that cell) and continues through the
// remaining cells the line passes through, interpolating cells the
// polyline crosses diagonally between two listed vertices.
const arrows = [
  ['R1C5', 'R1C6', 'R2C6', 'R3C7'],
  ['R4C7', 'R5C7', 'R5C6'],
  ['R4C5', 'R5C4', 'R6C3', 'R7C2'],
  ['R5C3', 'R4C2', 'R3C1'],
  ['R1C2', 'R2C3', 'R3C4', 'R4C3', 'R3C2', 'R2C1'],
  ['R9C8', 'R8C7', 'R7C6', 'R6C6', 'R7C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...arrows.map(cells => new Arrow(...cells)),
];
