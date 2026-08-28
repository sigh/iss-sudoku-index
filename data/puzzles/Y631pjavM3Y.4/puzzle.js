// Title: March 2, 2022: Arrow Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y631pjavM3Y
// Source: https://tinyurl.com/mwzdupxz

// Standard Sudoku, plus 8 arrows: digits along each arrow sum to the digit in
// its circle (the circled cell is the first cell of the arrow's line).
const givens = [
  new Given('R1C3', 5), new Given('R1C9', 1),
  new Given('R2C4', 6),
  new Given('R3C5', 7), new Given('R3C9', 2),
  new Given('R4C1', 1), new Given('R4C6', 8),
  new Given('R5C1', 4), new Given('R5C3', 3), new Given('R5C7', 9), new Given('R5C9', 5),
  new Given('R6C4', 4), new Given('R6C9', 6),
  new Given('R7C1', 8), new Given('R7C5', 5),
  new Given('R8C6', 6),
  new Given('R9C1', 5), new Given('R9C7', 7),
];

const arrows = [
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R2C2', 'R2C3', 'R2C4'),
  new Arrow('R3C3', 'R3C4', 'R3C5'),
  new Arrow('R7C5', 'R7C6', 'R7C7'),
  new Arrow('R8C6', 'R8C7', 'R8C8'),
  new Arrow('R9C7', 'R9C8', 'R9C9'),
  new Arrow('R1C7', 'R2C8', 'R3C9'),
  new Arrow('R7C1', 'R8C2', 'R9C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...arrows,
];
