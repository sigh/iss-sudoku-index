// Title: 9/30/22: For KNT and jovi_al
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xL75pjM7j9c
// Source: https://tinyurl.com/4x62t45v
//
// Normal sudoku rules apply.
// Digits along an arrow sum to the digit in the corresponding circle ->
// one Arrow(circle, ...arm) per arrow.
//
// Arrow cells were read off the payload's `arrow` entries: each entry's
// `cells` field names the circled cell and its `lines` path starts at that
// same cell before running through the arm cells.
const arrows = [
  ['R6C9', 'R6C8', 'R5C8', 'R4C8'],
  ['R9C4', 'R8C5', 'R8C6', 'R7C5'],
  ['R9C1', 'R8C2', 'R8C3', 'R7C2'],
  ['R6C1', 'R5C2', 'R5C3', 'R4C2'],
  ['R5C4', 'R6C4', 'R5C5', 'R4C4'],
  ['R3C4', 'R2C5', 'R2C6', 'R1C5'],
  ['R3C7', 'R2C8', 'R2C9', 'R1C8'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 9),
  new Given('R2C5', 5),
  new Given('R2C8', 6),
  new Given('R5C2', 4),
  new Given('R5C5', 3),
  new Given('R5C8', 1),
  new Given('R8C2', 2),
  new Given('R8C5', 6),
  new Given('R8C8', 9),
  ...arrows.map(cells => new Arrow(...cells)),
];
