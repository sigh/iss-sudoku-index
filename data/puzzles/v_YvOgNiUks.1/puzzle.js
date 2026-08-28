// Title: Sept. 15, 2021: Sum More Arrow
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=v_YvOgNiUks
// Source: https://tinyurl.com/ywydf69s
//
// Normal sudoku rules apply (standard 3x3 boxes). Digits along an arrow sum
// to the digit in its circle -> one Arrow(circle, ...arm) per arrow. Circles
// are single cells, so the circle cell is not one of the addends.
//
// Arrow cells are read from the payload's arrow[].lines entries, each of
// which already lists the circle cell first followed by the arm cells in
// drawn order.
const arrows = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R2C3', 'R2C4', 'R2C5'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R8C7', 'R8C6', 'R8C5'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C5', 'R6C4', 'R6C3', 'R6C2'],
  ['R5C8', 'R5C7', 'R5C6'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R4C9', 'R3C9', 'R2C9'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R1C6', 'R2C7', 'R3C8'],
  ['R9C4', 'R8C3', 'R7C2'],
  ['R8C4', 'R7C3'],
  ['R2C6', 'R3C7'],
];

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R3C3', 3),
  new Given('R4C1', 3),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R6C9', 7),
  new Given('R7C7', 7),
  new Given('R8C8', 8),
  new Given('R9C9', 9),

  ...arrows.map(cells => new Arrow(...cells)),
];
