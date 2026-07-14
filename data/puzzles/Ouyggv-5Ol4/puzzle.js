// Title: Follow-on Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Ouyggv-5Ol4
// Source: https://sudokupad.app/eo2tx5yh0c

// Normal sudoku rules. Digits along an arrow sum to the digit in that
// arrow's circle. Digits cannot repeat along the blue diagonal line.
//
// Ten 3-cell arrows chain into three "follow-on" runs: the arrowhead cell
// of one arrow is the circle of the next, so it is both an addend and a
// sum. Arrow(circle, arm1, arm2) below lists each arrow's circle first.
// The blue diagonal is the grid's own anti-diagonal (R9C1 .. R1C9),
// so the built-in Diagonal(1) covers it exactly.

const arrows = [
  // Run A: R3C1 -> R9C7
  ['R3C1', 'R4C2', 'R5C3'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R7C5', 'R8C6', 'R9C7'],
  // Run B: R1C3 -> R7C9
  ['R1C3', 'R2C4', 'R3C5'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R5C7', 'R6C8', 'R7C9'],
  // Run C: R9C9 -> R1C1
  ['R9C9', 'R8C8', 'R7C7'],
  ['R7C7', 'R6C6', 'R5C5'],
  ['R5C5', 'R4C4', 'R3C3'],
  ['R3C3', 'R2C2', 'R1C1'],
];

return [
  new Shape('9x9'),
  new Given('R2C7', 7),
  new Given('R5C6', 8),
  new Given('R8C5', 1),
  new Diagonal(1), // blue no-repeat diagonal, R9C1..R1C9
  ...arrows.map(cells => new Arrow(...cells)),
];
