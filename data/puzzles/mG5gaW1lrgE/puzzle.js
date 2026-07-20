// Title: ???
// Author: Molly Boodey
// Video: https://www.youtube.com/watch?v=mG5gaW1lrgE
// Source: https://sudokupad.app/163r5iyx6s

// Standard Sudoku, with the drawn killer cage, thermometer, German whispers,
// arrow, black Kropki dot, and quadruple.
const whispers = [
  new Whisper(5, 'R2C1', 'R1C2', 'R1C3', 'R2C4', 'R3C3', 'R4C3'),
  new Whisper(5, 'R7C4', 'R7C3', 'R6C2', 'R7C1', 'R8C1', 'R9C2'),
  new Whisper(5, 'R8C9', 'R9C8', 'R9C7', 'R8C6', 'R7C7', 'R6C7'),
  new Whisper(5, 'R3C6', 'R3C7', 'R4C8', 'R3C9', 'R2C9', 'R1C8'),
];

return [
  new Shape('9x9'),
  new Cage(7, 'R1C2', 'R1C3'),
  new Thermo('R3C5', 'R3C6', 'R3C7'),
  ...whispers,
  new Arrow('R5C7', 'R6C7', 'R7C7', 'R8C6'),
  new BlackDot('R4C3', 'R5C3'),
  new Quad('R6C4', 4, 7, 7),
];
