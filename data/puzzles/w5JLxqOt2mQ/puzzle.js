// Title: Extra Large Regions
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=w5JLxqOt2mQ
// Source: https://app.crackingthecryptic.com/sudoku/Bt9JtNfjqP

// Normal sudoku rules apply (rows, columns, and the nine standard 3x3 boxes,
// all all-different -- the default Shape('9x9') regions, unmodified). Each of
// the two 18-cell grey regions must contain the digits 1-9 exactly twice
// (not the usual once-each region rule, and no additional distinctness
// within a region is stated, so ContainExact is used rather than a cage-like
// class that would also force distinctness).
//
// The payload draws the shading as 36 identical 1x1 grey underlays with no
// group ids; region membership below is the two orthogonally-connected
// components of that shading (18 cells each), read directly from the drawn
// cell coordinates.

const regionA = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4',
  'R2C1',
  'R3C1', 'R3C2', 'R3C3', 'R3C4',
  'R4C1', 'R4C2', 'R4C3', 'R4C4',
  'R5C1',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
];

const regionB = [
  'R4C6', 'R4C7', 'R4C8', 'R4C9',
  'R5C6', 'R5C9',
  'R6C6', 'R6C7', 'R6C8', 'R6C9',
  'R7C6', 'R7C7', 'R7C8',
  'R8C6', 'R8C8',
  'R9C6', 'R9C8', 'R9C9',
];

// Each value 1-9 must occur exactly twice in an 18-cell region.
const eachDigitTwice = '1_1_2_2_3_3_4_4_5_5_6_6_7_7_8_8_9_9';

return [
  new Shape('9x9'),

  // Givens (from the source's drawn cell values).
  new Given('R1C7', 3), new Given('R1C8', 4), new Given('R1C9', 1),
  new Given('R2C7', 2), new Given('R2C9', 7),
  new Given('R3C5', 1), new Given('R3C6', 4), new Given('R3C7', 6),
  new Given('R3C8', 9), new Given('R3C9', 8),
  new Given('R4C5', 2),
  new Given('R5C5', 3),
  new Given('R6C5', 4),
  new Given('R7C1', 1), new Given('R7C2', 9), new Given('R7C3', 2),
  new Given('R7C4', 6), new Given('R7C5', 5),
  new Given('R8C1', 6), new Given('R8C3', 8),
  new Given('R9C1', 3), new Given('R9C2', 5), new Given('R9C3', 7),

  new ContainExact(eachDigitTwice, ...regionA),
  new ContainExact(eachDigitTwice, ...regionB),
];
