// Title: So Ubuji
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/2p8d97hh

// Normal sudoku rules apply. 12 arrows: the two arm digits of each arrow sum
// to the digit shown in its circled bulb cell (Arrow's bulb-then-arm order).
// The twelve arrows form a four-fold rotationally symmetric pinwheel, three
// per corner, each an L of one bulb + two arm cells (payload `arrow[].cells`
// = bulb, `arrow[].lines[0]` = full bulb+arm path).

const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R3C7', 'R4C7', 'R5C7'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R8C8', 'R8C7', 'R8C6'],
  ['R7C7', 'R7C6', 'R7C5'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R8C2', 'R7C2', 'R6C2'],
  ['R7C3', 'R6C3', 'R5C3'],
];

return [
  new Shape('9x9'),

  new Given('R1C3', 6),
  new Given('R2C4', 5),
  new Given('R3C5', 4),
  new Given('R3C9', 7),
  new Given('R4C4', 8),
  new Given('R4C6', 3),
  new Given('R4C8', 6),
  new Given('R5C3', 7),
  new Given('R5C7', 1),
  new Given('R6C2', 3),
  new Given('R6C4', 6),
  new Given('R6C6', 5),
  new Given('R7C1', 3),
  new Given('R7C5', 2),
  new Given('R8C6', 1),
  new Given('R9C7', 7),

  ...arrows.map((cells) => new Arrow(...cells)),
];
