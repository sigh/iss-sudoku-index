// Title: Turn That Frown...
// Author: The Chiropractor
// Video: https://www.youtube.com/watch?v=OagC8VOlw24
// Source: https://tinyurl.com/224j47pw

// Normal sudoku rules apply (rows, columns, boxes all-different, from the
// default Shape). Digits in a cage sum to the printed total and do not
// repeat within the cage (Cage). Digits along an arrow sum to the digit in
// its attached circle; each circle is a single ordinary grid cell, not a
// separate pill (Arrow, bulb cell first).

const cages = [
  [23, 'R4C2', 'R4C3', 'R5C2', 'R6C2'],
  [20, 'R4C4', 'R5C4', 'R6C3', 'R6C4'],
  [21, 'R4C6', 'R4C7', 'R5C6', 'R6C6'],
  [16, 'R4C8', 'R5C8', 'R6C7', 'R6C8'],
  [15, 'R8C5', 'R9C5'],
  [22, 'R1C9', 'R2C9', 'R3C9'],
  [22, 'R1C1', 'R2C1', 'R3C1'],
  [10, 'R8C6', 'R8C7'],
  [10, 'R9C6', 'R9C7', 'R9C8'],
  [13, 'R8C3', 'R8C4'],
  [19, 'R9C2', 'R9C3', 'R9C4'],
];

const arrows = [
  ['R6C2', 'R7C1', 'R8C1', 'R9C1'],
  ['R6C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R4C6', 'R3C5', 'R2C5', 'R1C5'],
  ['R4C9', 'R3C8', 'R2C8'],
  ['R3C2', 'R2C2', 'R1C2'],
  ['R3C6', 'R2C7', 'R1C8'],
];

return [
  new Shape('9x9'),

  new Given('R3C5', 2),
  new Given('R5C3', 3),
  new Given('R5C7', 9),
  new Given('R7C5', 7),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...arrows.map((cells) => new Arrow(...cells)),
];
