// Title: Crosses and Pluses
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=QnssyQnMXcs
// Source: https://app.crackingthecryptic.com/sudoku/Qg4f4dQjmF

// Standard sudoku (rows, columns, boxes all-different). Every box's center
// cell carries a "cross" (diagonal X) or a "plus" (orthogonal +): two 3-cell
// lines crossing at that center. Diagonal (cross) lines are renban: their
// three digits are consecutive, in any order. On each plus, the horizontal
// line's total equals the vertical line's total (the shared total may vary
// by plus).

const crossLines = [
  // R2C2 (box 1)
  ['R1C1', 'R2C2', 'R3C3'], ['R1C3', 'R2C2', 'R3C1'],
  // R2C8 (box 3)
  ['R3C7', 'R2C8', 'R1C9'], ['R1C7', 'R2C8', 'R3C9'],
  // R5C5 (box 5)
  ['R4C4', 'R5C5', 'R6C6'], ['R4C6', 'R5C5', 'R6C4'],
  // R8C2 (box 7)
  ['R7C1', 'R8C2', 'R9C3'], ['R7C3', 'R8C2', 'R9C1'],
  // R8C8 (box 9)
  ['R9C7', 'R8C8', 'R7C9'], ['R7C7', 'R8C8', 'R9C9'],
];

// Each plus: [vertical line, horizontal line], both through the center cell.
const pluses = [
  [['R1C5', 'R2C5', 'R3C5'], ['R2C4', 'R2C5', 'R2C6']], // R2C5 (box 2)
  [['R4C2', 'R5C2', 'R6C2'], ['R5C1', 'R5C2', 'R5C3']], // R5C2 (box 4)
  [['R4C8', 'R5C8', 'R6C8'], ['R5C7', 'R5C8', 'R5C9']], // R5C8 (box 6)
  [['R7C5', 'R8C5', 'R9C5'], ['R8C4', 'R8C5', 'R8C6']], // R8C5 (box 8)
];

return [
  new Shape('9x9'),

  new Given('R2C7', 1),
  new Given('R3C2', 8),
  new Given('R3C3', 6),
  new Given('R3C6', 5),
  new Given('R4C1', 8),
  new Given('R5C5', 7),
  new Given('R6C3', 7),
  new Given('R9C9', 2),

  ...crossLines.map(cells => new Renban(...cells)),

  ...pluses.map(([vert, horiz]) => new EqualSum(vert, horiz)),
];
