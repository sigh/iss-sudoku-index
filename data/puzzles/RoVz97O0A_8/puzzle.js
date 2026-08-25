// Title: The Wolf
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=RoVz97O0A_8
// Source: https://app.crackingthecryptic.com/webapp/dBB96Tj2rT

// Standard killer sudoku: normal sudoku rules, plus 14 cages where digits
// must sum to the printed total and cannot repeat within the cage. One cage
// (R2C5,R3C5,R4C5,R5C5) carries no printed total, so it is encoded as
// all-different only. The remaining 20 grid cells belong to no cage and
// carry only the default row/column/box constraints. Background cell
// colouring in the source (a wolf-face decoration matching the title)
// carries no stated rule and is omitted.

const cages = [
  [22, 'R1C2', 'R1C3', 'R1C4', 'R2C3', 'R2C4', 'R3C4'],
  [38, 'R1C6', 'R2C6', 'R3C6', 'R2C7', 'R1C7', 'R1C8'],
  [22, 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R3C2', 'R4C3'],
  [12, 'R5C1', 'R5C2'],
  [12, 'R5C3', 'R5C4', 'R4C4', 'R6C4'],
  [28, 'R4C6', 'R5C6', 'R6C6', 'R5C7'],
  [38, 'R4C7', 'R4C8', 'R4C9', 'R3C8', 'R3C9', 'R2C9'],
  [8, 'R5C8', 'R5C9'],
  [19, 'R6C5', 'R7C5', 'R8C5', 'R8C4', 'R8C6'],
  [15, 'R7C9', 'R8C9', 'R9C9'],
  [16, 'R7C1', 'R8C1', 'R9C1'],
  [28, 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C4'],
  [17, 'R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  // No printed total: all-different only.
  new AllDifferent('R2C5', 'R3C5', 'R4C5', 'R5C5'),
];
