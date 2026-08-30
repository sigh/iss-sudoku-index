// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qfjlU9fOGDE
// Source: https://cracking-the-cryptic.web.app/sudoku/r6tHpMP7rd

// The seven drawn lines are plain grey strokes, each with a matching grey
// filled circle at one end -- the standard SudokuPad thermometer rendering --
// so each is a Thermo: digits increase strictly from the bulb (listed first
// below) to the open end.
const thermometers = [
  new Thermo('R1C2', 'R1C3', 'R1C4', 'R2C4', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Thermo('R2C7', 'R2C8', 'R2C9', 'R3C9', 'R3C8', 'R3C7', 'R4C7', 'R4C8', 'R4C9'),
  new Thermo('R5C2', 'R6C2', 'R7C2', 'R8C2'),
  new Thermo('R4C4', 'R4C3', 'R4C2'),
  new Thermo('R8C3', 'R8C4', 'R7C4', 'R6C4', 'R5C4'),
  new Thermo('R9C6', 'R8C6', 'R7C6', 'R6C6'),
  new Thermo('R6C7', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C7'),
];

return [
  new Shape('9x9'),
  ...thermometers,
];
