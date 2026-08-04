// Title: Brand New Bass Guitar
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=FN3oEZZizb0
// Source: https://tinyurl.com/yuyakr4p

// Normal sudoku rules apply. Digits on a thermometer must strictly increase
// as they move away from the bulb; each Thermo's first cell is the bulb
// (payload's thermometer.lines order is bulb-first).

const givens = [
  new Given('R1C3', 6), new Given('R1C4', 7),
  new Given('R2C2', 8), new Given('R2C5', 3), new Given('R2C8', 4),
  new Given('R3C1', 5),
  new Given('R4C1', 4),
  new Given('R5C2', 7), new Given('R5C8', 3),
  new Given('R6C9', 6),
  new Given('R7C9', 5),
  new Given('R8C2', 6), new Given('R8C5', 7), new Given('R8C8', 2),
  new Given('R9C6', 3), new Given('R9C7', 4),
];

// Bulb cell listed first in each triple, per the drawn thermometer.lines order.
const thermos = [
  new Thermo('R3C3', 'R2C2', 'R1C1'),
  new Thermo('R3C4', 'R2C5', 'R1C6'),
  new Thermo('R4C3', 'R5C2', 'R6C1'),
  new Thermo('R4C4', 'R5C5', 'R6C6'),
  new Thermo('R3C9', 'R2C8', 'R1C7'),
  new Thermo('R4C9', 'R5C8', 'R6C7'),
  new Thermo('R9C9', 'R8C8', 'R7C7'),
  new Thermo('R9C4', 'R8C5', 'R7C6'),
  new Thermo('R9C3', 'R8C2', 'R7C1'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
