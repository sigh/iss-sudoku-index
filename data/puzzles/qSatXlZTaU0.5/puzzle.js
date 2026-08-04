// Title: January 8, 2023: Arrowdynamics
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=qSatXlZTaU0
// Source: https://tinyurl.com/3yny8uxe
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Digits along an arrow sum to the digit in the circle -> one
// Arrow(circle, ...arm) per arrow. Each of the four circles anchors five
// independent arrows (a single circle cell feeding five separate lines), so
// each line is its own Arrow constraint sharing the same first (circle) cell.
//
// Circle/arm cells were read from the payload's `arrow` array: each entry's
// `cells` is the circle, and each of its `lines` is one arrow path starting
// at the circle and running through its arm cells.
const arrows = [
  // Circle R3C3
  ['R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C3', 'R4C4', 'R5C5'],
  ['R3C3', 'R2C2', 'R1C1'],
  ['R3C3', 'R2C4'],
  ['R3C3', 'R4C2'],
  // Circle R3C7
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R3C7', 'R4C6', 'R5C5'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R3C7', 'R4C8'],
  ['R3C7', 'R2C6'],
  // Circle R7C3
  ['R7C3', 'R6C3', 'R5C3', 'R4C3'],
  ['R7C3', 'R6C4', 'R5C5'],
  ['R7C3', 'R8C2', 'R9C1'],
  ['R7C3', 'R6C2'],
  ['R7C3', 'R8C4'],
  // Circle R7C7
  ['R7C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R7C7', 'R6C6', 'R5C5'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R7C7', 'R8C6'],
  ['R7C7', 'R6C8'],
];

return [
  new Shape('9x9'),
  new Given('R1C5', 6),
  new Given('R2C5', 1),
  new Given('R5C1', 7),
  new Given('R5C2', 2),
  new Given('R5C8', 8),
  new Given('R5C9', 3),
  new Given('R8C5', 9),
  new Given('R9C5', 4),
  ...arrows.map(cells => new Arrow(...cells)),
];
