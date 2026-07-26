// Title: Set Square
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=YE-26zijRN8
// Source: https://sudokupad.app/f6dn9b0b9v

// Standard Sudoku is implicit; the only given is R1C1=4. Renban lines hold a
// non-repeating consecutive set in any order. White dots are a positive-only
// Kropki reading (the ruleset disclaims a negative: "Not all dots are
// necessarily given"), so unmarked adjacent pairs get no constraint.
const renbans = [
  new Renban('R1C4', 'R2C4', 'R3C4', 'R4C4'),
  new Renban('R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Renban('R4C3', 'R4C2', 'R4C1', 'R5C1'),
  new Renban('R5C2', 'R5C3', 'R5C4', 'R5C5'),
  new Renban('R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Renban('R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
  new Renban('R3C1', 'R2C2', 'R1C3'),
  new Renban('R2C3', 'R3C3', 'R3C2'),
  new Renban('R6C1', 'R6C2', 'R7C2'),
  new Renban('R2C7', 'R2C6', 'R3C6'),
  new Renban('R3C7', 'R3C8'),
  new Renban('R7C3', 'R8C3'),
  new Renban('R1C7', 'R1C8'),
  new Renban('R9C4', 'R8C5'),
  new Renban('R4C8', 'R3C9'),
  new Renban('R9C1', 'R8C2'),
];

const whiteDots = [
  new WhiteDot('R5C1', 'R5C2'),
  new WhiteDot('R1C4', 'R1C5'),
  new WhiteDot('R4C3', 'R4C4'),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  ...renbans,
  ...whiteDots,
];
