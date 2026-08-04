// Title: Whirlwind
// Author: MasterHope
// Video: https://www.youtube.com/watch?v=3d8q9TkfhcY
// Source: https://app.crackingthecryptic.com/sudoku/Rm9dLN86Gd

// Normal sudoku on the standard 3x3 boxes. Cages sum to their total with no
// repeated digit inside the cage. Each arrow's arm digits sum to the digit
// placed in its (unlabelled) circle; two circles each carry two separate
// arrows, so the circle's digit is the sum of each arm independently.

const cages = [
  new Cage(13, 'R1C6', 'R1C7'),
  new Cage(25, 'R7C6', 'R7C7', 'R8C6', 'R8C7', 'R9C6', 'R9C7'),
  new Cage(13, 'R7C3', 'R7C4', 'R8C3', 'R8C4'),
  new Cage(11, 'R6C3', 'R6C4'),
];

// Arrow(bulb, ...arm): arm digits sum to the bulb's digit.
const arrows = [
  new Arrow('R4C8', 'R4C7', 'R4C6', 'R5C6', 'R5C7'),
  new Arrow('R4C8', 'R3C7', 'R3C6'),
  new Arrow('R6C6', 'R6C7', 'R5C8'),
  new Arrow('R3C2', 'R3C3', 'R3C4', 'R4C4', 'R4C3'),
  new Arrow('R3C2', 'R2C3', 'R2C4'),
  new Arrow('R9C4', 'R9C3', 'R8C2'),
  new Arrow('R7C1', 'R6C2', 'R5C2'),
  new Arrow('R3C1', 'R4C2'),
  new Arrow('R3C9', 'R2C9', 'R2C8'),
];

return [
  new Shape('9x9'),
  new Given('R8C9', 9),
  new Given('R9C1', 6),
  ...cages,
  ...arrows,
];
