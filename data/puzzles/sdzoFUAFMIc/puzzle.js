// Title: Maximum Effort
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=sdzoFUAFMIc
// Source: https://sudokupad.app/qs53ivj39n

// Normal sudoku rules apply. Standard arrows: digits along an arrow sum to
// the digit in its circle (circled cell first, then the arm cells). Double
// arrows: digits on the line between two circles sum to the total of the two
// circled digits (first and last cells are the circles). Green lines: adjacent
// digits differ by at least 5 (Whisper). The killer cage shows its sum and is
// all-different (Cage's default).
//
// Arrows 4 and 5 share their circle at R9C5 (two arms from one circle).

const arrows = [
  ['R4C3', 'R3C3', 'R3C4', 'R4C4'],
  ['R5C1', 'R4C1', 'R3C1', 'R2C2'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C8'],
  ['R9C5', 'R9C4', 'R9C3', 'R8C3'],
  ['R9C5', 'R9C6', 'R9C7', 'R8C7'],
  ['R6C7', 'R7C7', 'R7C6', 'R6C6'],
];

const doubleArrows = [
  ['R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R1C9', 'R2C9', 'R3C9'],
];

const greenLines = [
  ['R2C3', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7'],
  ['R6C8', 'R7C8'],
  ['R3C8', 'R4C8'],
  ['R4C2', 'R5C2', 'R6C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 4),

  new Cage(7, 'R2C4', 'R2C5', 'R2C6'),

  ...arrows.map(cells => new Arrow(...cells)),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
