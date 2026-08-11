// Title: Scorpion
// Author: udukos
// Video: https://www.youtube.com/watch?v=m-TrUrKYUiw
// Source: https://app.crackingthecryptic.com/sudoku/QTN4GLJFtT

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits along an
// arrow must sum to the digit in that arrow's circle.
//
// 11 drawn arrows (a 12th drawing entry carries no path and renders
// nothing, so it is not a clue). Two circles each anchor two arrows
// (R2C2 and R8C3), giving 9 distinct bulb cells for 11 arrows. Cell lists
// below run bulb-outward, matching the drawn waypoints; two arrows bend
// through a straight two-cell gap whose interpolated midpoint cell
// (R6C7, R8C7) is included in the arm.
const arrows = [
  new Arrow('R2C2', 'R2C3', 'R1C3'),
  new Arrow('R2C2', 'R2C1', 'R3C1'),
  new Arrow('R8C3', 'R7C3', 'R7C4'),
  new Arrow('R5C5', 'R6C6', 'R6C7', 'R6C8'),
  new Arrow('R4C5', 'R3C6', 'R2C6'),
  new Arrow('R4C4', 'R3C3'),
  new Arrow('R5C4', 'R6C3', 'R6C2'),
  new Arrow('R4C1', 'R3C2'),
  new Arrow('R4C9', 'R3C8', 'R2C8', 'R2C7'),
  new Arrow('R8C3', 'R9C4'),
  new Arrow('R9C5', 'R8C6', 'R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...arrows,
];
