// Title: Nuts and Bolts
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=eXAb7nRcveM
// Source: https://app.crackingthecryptic.com/kt1pesfm29

// Standard Sudoku. Box borders split each blue line into equal-sum segments.
// Cages have distinct digits and their shown totals. The black dot is a 1:2 ratio.

const lines = [
  ['R3C9', 'R3C8', 'R4C8', 'R4C9'],
  ['R6C5', 'R6C4', 'R7C4', 'R7C5'],
  ['R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C7', 'R6C6', 'R5C6', 'R4C6'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C3', 'R6C2', 'R5C2', 'R4C2', 'R4C3'],
  ['R5C6', 'R6C7', 'R5C8', 'R4C7'],
  ['R6C3', 'R5C2', 'R4C3', 'R5C4'],
  ['R9C7', 'R9C8', 'R8C8', 'R7C8', 'R7C7', 'R7C6', 'R8C6', 'R9C6'],
  ['R9C7', 'R8C8', 'R7C7', 'R8C6'],
  ['R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R2C4', 'R1C4'],
  ['R2C4', 'R3C3', 'R2C2', 'R1C3'],
];

return [
  new Shape('9x9'),
  // Cage cells and totals transcribed from the drawn cages.
  new Cage(8, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(9, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(8, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(9, 'R1C9', 'R2C9', 'R3C9'),
  new BlackDot('R2C2', 'R3C2'),
  // Closed paths are rotated at a box boundary, so a same-box segment does not
  // straddle the ends of a RegionSumLine cell list.
  ...lines.map(cells => new RegionSumLine(...cells)),
];
