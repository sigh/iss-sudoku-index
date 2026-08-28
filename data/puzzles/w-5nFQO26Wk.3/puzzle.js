// Title: Nov 6, 2021: Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=w-5nFQO26Wk
// Source: https://tinyurl.com/453d5w7y

// Normal sudoku rules apply. Each arrow is a two-cell horizontal pill (the
// bulb) plus one or more line arms; the digits along an arm sum to the
// pill's value, read left to right as a two-digit number. Where a pill has
// several arms (below), each sums to that pill independently.
//
// The source's own arrow arrays include the pill cell an arm starts from as
// that arm's first path element (a rendering artifact connecting the arm to
// the pill it leaves); PillArrow takes the pill cells followed only by the
// non-pill arm cells, so that leading duplicate is dropped here.

return [
  new Shape('9x9'),

  new Given('R2C1', 3), new Given('R2C3', 4),
  new Given('R3C4', 5), new Given('R3C6', 3),
  new Given('R4C7', 4), new Given('R4C9', 5),
  new Given('R5C4', 4),
  new Given('R6C7', 3),
  new Given('R7C2', 4), new Given('R7C6', 5),
  new Given('R9C4', 3), new Given('R9C6', 4),

  // Pill R1C1-R1C2, one arm down column 1.
  new PillArrow(2, 'R1C1', 'R1C2', 'R2C1', 'R3C1'),
  // Pill R5C5-R5C6, one arm up column 6.
  new PillArrow(2, 'R5C5', 'R5C6', 'R4C6', 'R3C6'),
  // Pill R6C8-R6C9, one arm up column 9.
  new PillArrow(2, 'R6C8', 'R6C9', 'R5C9', 'R4C9'),
  // Pill R8C6-R8C7, one arm up column 7.
  new PillArrow(2, 'R8C6', 'R8C7', 'R7C7', 'R6C7'),

  // Pill R2C4-R2C5, two arms: down column 4, and right along row 2.
  new PillArrow(2, 'R2C4', 'R2C5', 'R3C4', 'R4C4'),
  new PillArrow(2, 'R2C4', 'R2C5', 'R2C6', 'R2C7'),

  // Pill R3C7-R3C8, two arms: down column 7, and up column 8.
  new PillArrow(2, 'R3C7', 'R3C8', 'R4C7', 'R5C7'),
  new PillArrow(2, 'R3C7', 'R3C8', 'R2C8', 'R1C8'),

  // Pill R4C2-R4C3, two arms: up column 3, and down column 2.
  new PillArrow(2, 'R4C2', 'R4C3', 'R3C3', 'R2C3'),
  new PillArrow(2, 'R4C2', 'R4C3', 'R5C2', 'R6C2'),

  // Pill R7C3-R7C4, three arms: up column 4, right along row 7, down column 4.
  new PillArrow(2, 'R7C3', 'R7C4', 'R6C4', 'R5C4'),
  new PillArrow(2, 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new PillArrow(2, 'R7C3', 'R7C4', 'R8C4', 'R9C4'),
];
