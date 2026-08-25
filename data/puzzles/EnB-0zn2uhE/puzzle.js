// Title: Extra Regions Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=EnB-0zn2uhE
// Source: https://app.crackingthecryptic.com/PfjHpGmrGR
//
// Standard sudoku (rows, columns, boxes) plus two shaded 9-cell regions
// (Region A, Region B), each also containing 1-9. AllDifferent over each
// 9-cell region, on a 9-value grid, is equivalent to "contains 1-9".

const regionA = [
  'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R6C5', 'R7C2', 'R7C3', 'R7C4', 'R8C4',
];

const regionB = [
  'R2C6', 'R3C6', 'R3C7', 'R3C8', 'R4C5', 'R4C6', 'R4C7', 'R5C7', 'R6C7',
];

return [
  new Shape('9x9'),

  new Given('R1C1', 5), new Given('R1C2', 6), new Given('R1C3', 7), new Given('R1C4', 8),
  new Given('R2C1', 4), new Given('R2C4', 9),
  new Given('R3C1', 3),
  new Given('R4C1', 7), new Given('R4C4', 1),
  new Given('R5C1', 1), new Given('R5C4', 2), new Given('R5C5', 3), new Given('R5C6', 4), new Given('R5C9', 9),
  new Given('R6C6', 5), new Given('R6C9', 3),
  new Given('R7C9', 4),
  new Given('R8C6', 8), new Given('R8C9', 5),
  new Given('R9C6', 9), new Given('R9C7', 8), new Given('R9C8', 7), new Given('R9C9', 6),

  new AllDifferent(...regionA),
  new AllDifferent(...regionB),
];
