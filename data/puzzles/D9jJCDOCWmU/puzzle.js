// Title: my 1st puzzle :)
// Author: Mel
// Video: https://www.youtube.com/watch?v=D9jJCDOCWmU
// Source: https://sudokupad.app/e26ddsfp6n

// Standard Sudoku with anti-king, killer cages, German whispers,
// thermometers, and one non-negative white Kropki dot.

const givens = [
  new Given('R3C3', 7),
  new Given('R7C7', 7),
];

const cages = [
  new Cage(17, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1'),
  new Cage(8, 'R1C4', 'R2C4', 'R3C4'),
  new Cage(15, 'R3C2', 'R4C2', 'R5C2'),
];

const whispers = [
  new Whisper(5, 'R5C5', 'R5C6', 'R5C7'),
  new Whisper(5, 'R3C5', 'R3C6', 'R4C6'),
  new Whisper(5, 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8'),
  new Whisper(5, 'R8C2', 'R8C3'),
];

const thermometers = [
  new Thermo('R4C4', 'R4C3', 'R4C2', 'R3C2'),
  new Thermo('R2C1', 'R2C2', 'R2C3', 'R2C4'),
  new Thermo('R6C4', 'R6C5', 'R6C6', 'R5C6'),
  new Thermo('R6C9', 'R7C8'),
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...givens,
  ...cages,
  ...whispers,
  ...thermometers,
  new WhiteDot('R9C6', 'R9C7'),
];
